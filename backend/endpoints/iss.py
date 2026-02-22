""" Endpoints for all routes starting wth /iss.
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
    

@bp.route('/tle', methods=["GET"])
@db
def iss_tle(sql):
    """ Gets the most recently retrieved TLE data of the ISS.

        :param sql: the sql cursor, provided by the @db decorator.
        :returns: a json object with the following format:
        {
            "id": 1,
            "tle_timestamp": 1686110400,
            "tle_line_1": "1 25544U 98067A   24181.51782528  .00016717  00000+0  10270-3 0 00000",
            "tle_line_2": "2 25544  51.6447  21.4417 0007418  90.9335 269.2012 15.50000000    11"
        }
    """
    result = sql.execute("SELECT * FROM iss ORDER BY request_timestamp DESC LIMIT 1;").fetchone()
    if result is None or len(result) == 0:
        abort(500, 'Server could not retrieve TLE data from database')
    data = dict(result)
    data.pop('id')
    data.pop('request_timestamp')
    return jsonify(data) # pop id since it is not relevant to the frontend

@bp.route('/trajectory', methods=["GET"])
@db
def iss_trajectory(sql):
    # TODO for now, we just return the points in the db. need to
    # return a react-digestible line element somehow though.
    result = sql.execute("SELECT * FROM iss;").fetchall()
    response = []
    for r in result:
        r = dict(r)
        r['datetime'] = str(datetime.fromtimestamp(r.pop('tle_timestamp')))
        # pop id and request_timestamp since they are not relevant to the frontend
        r.pop('id')
        r.pop('request_timestamp')
        response.append(r)
    return jsonify(response)