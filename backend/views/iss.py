""" Endpoints for ISS.
"""
from flask import (
    Blueprint,
    abort,
    request,
    jsonify
)
from datetime import datetime
from backend.db import db

bp = Blueprint('iss', __name__, url_prefix='/iss')

@bp.route('/intercept', methods=["GET"])
@db
def iss_intercept(sql):
    """ returns the time (expressed in seconds since unix epoch) the ISS will next be
        visible from a set of provided querystring lat/lon coords.

        example:
            request: <host>:<port>/iss/intercept?lat=50.3&lon=-0.45
            response: {
                'timestamp': 188138481
            }
    
        :param sql: the sql cursor, provided by the @db decorator.
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if lat is None or lon is None:
        abort(400, 'lat and lon required in querystring')
    # TODO implement timefinder logic
    return
    

@bp.route('/location', methods=["GET"])
@db
def iss_location(sql):
    """ Gets the last known earth coordinates of the ISS.

        :param sql: the sql cursor, provided by the @db decorator.
    """
    # TODO
    return

@bp.route('/trajectory', methods=["GET"])
@db
def iss_trajectory(sql):
    # TODO for now, we just return the points in the db. need to
    # return a react-digestible line element somehow though.
    result = sql.execute("SELECT * FROM iss;").fetchall()
    response = []
    for r in result:
        r = dict(r)
        r['datetime'] = str(datetime.fromtimestamp(r['timestamp']))
        r.pop('timestamp')
        response.append(r)
    return jsonify(response)