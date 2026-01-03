""" View for ISS page.
"""

import functools
from flask import (
    Blueprint,
    flash,
    g,
    redirect,
    render_template,
    request,
    session,
    url_for
)
from datetime import datetime
from backend.db import db

bp = Blueprint('iss', __name__, url_prefix='')


@bp.route('/', methods=["GET", "POST"])
@db
def iss(sql):
    args = {}
    if request.method == "POST":
        lat = request.form['lat']
        lon = request.form['lon']
        args['success'] = True
        # TODO implement time finder logic
    result = sql.execute("SELECT * FROM iss;").fetchall()
    points = []
    for r in result:
        r = dict(r)
        r['datetime'] = str(datetime.fromtimestamp(r['timestamp']))
        r.pop('timestamp')
        points.append(r)
    args['points'] = points
    return render_template('iss/iss.html', **args)