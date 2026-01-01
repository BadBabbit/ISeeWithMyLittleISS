""" The handler for the WhereTheISSAt api.

    https://wheretheiss.at/w/developer
"""

import requests
import time
import sqlite3
import threading
from datetime import datetime
from flask import g
from config import ISS_API_URL, ISS_API_TIMEOUT, ISS_API_RATE_LIMIT, ISS_MAX_ROWS
from db import db
import transaction

INSERT_ISS_DATA_STATEMENT = """
    INSERT INTO iss
    VALUES (:timestamp, :latitude, :longitude);
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

class ISSApiError(Exception):
    """ Custom exception for ISS API errors.
    """
    pass

@db
def iss_api_daemon():
    """ Daemon thread that repeatedly gets a location, adds it to the database, deletes the oldest entry if there are more than the max allowed rows in the db.
    """
    try:
        response = requests.get(ISS_API_URL, timeout=ISS_API_TIMEOUT).json()
        if response == None:
            raise ISSApiError
    except ISSApiError:
        # TODO handle
        pass
    g.sql.execute(INSERT_ISS_DATA_STATEMENT, *response)
    if len(list(g.sql.fetchall("SELECT * FROM iss;"))) > ISS_MAX_ROWS:
        g.sql.execute(DELETE_ISS_DATA_STATEMENT, max_rows=ISS_MAX_ROWS)
    time.sleep(ISS_API_RATE_LIMIT)
