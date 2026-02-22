""" The handler for the WhereTheISSAt api.

    https://wheretheiss.at/w/developer
"""
import requests
import time
from flask import g
from .config import ISS_API_URL, ISS_API_TIMEOUT, ISS_API_RATE_LIMIT, ISS_MAX_ROWS
from .db import get_db, close_db
from threading import Event, current_thread

INSERT_ISS_DATA_STATEMENT = """
    INSERT INTO iss (timestamp, tle_line_1, tle_line_2)
    VALUES (:timestamp, :tle_line_1, :tle_line_2);
"""

DELETE_ISS_DATA_STATEMENT = """
    DELETE FROM iss 
    WHERE timestamp NOT IN (
        SELECT timestamp
        FROM iss
        ORDER BY timestamp DESC
        LIMIT :max_rows
    );
"""

class ISSApiTimeoutError(Exception):
    """ Custom exception for ISS API timeout.
    """
    pass

class ISSApiStatusError(Exception):
    """ Custom exception for ISS API non-200 responses.
    """
    pass

def get_iss_tle(app, cur):
    """ Gets the current TLE data for the ISS and writes it to the database

        :param app: Flask application instance
        :param cur: db cursor
        :returns: None
    """
    try:
        request = requests.get(ISS_API_URL + "/satellites/25544/tles", timeout=ISS_API_TIMEOUT)
        response = request.json()
        if response is None:
            raise ISSApiTimeoutError(f"API timed out")
        if request.status_code != 200:
            raise ISSApiStatusError(f"API responded with status code {request.status_code}")
        cur.execute(INSERT_ISS_DATA_STATEMENT, {
            "timestamp": response["timestamp"],
            "tle_line_1": response["line1"],
            "tle_line_2": response["line2"]
        })
        row_count = cur.execute("SELECT COUNT(*) FROM iss;").fetchone()[0]
        if row_count >= 2:
            cur.execute(DELETE_ISS_DATA_STATEMENT, {"max_rows": ISS_MAX_ROWS})
        cur.commit()
        app.logger.info("TLE data successly pulled from API.")
    except ISSApiTimeoutError as e:
        app.logger.warning(e)
    except ISSApiStatusError as e:
        app.logger.error(e)
    except (InterruptedError, KeyboardInterrupt):
        app.logger.info("ISS API daemon interrupted")
        cur.rollback()
        return
    except Exception as e:
        app.logger.error(f"Unexpected ISS API daemon error: {e}")
        cur.rollback()

def iss_api_daemon(app, stop_event):
    """ Daemon thread that repeatedly gets a location, adds it to the database, deletes the oldest entry if there are more than the max allowed rows in the db.
    
        :param app: Flask application instance
        :param stop_event: Threading event to signal shutdown
    """
    with app.app_context():
        app.logger.info("ISS API daemon starting...")
        cur = get_db()
        while not stop_event.is_set():
            get_iss_tle(app, cur)
            stop_event.wait(ISS_API_RATE_LIMIT)
        close_db()
        app.logger.info(f"{current_thread().name} terminated.")
