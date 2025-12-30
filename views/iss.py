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
from iseeiss.db import db

bp = Blueprint('iss', __name__, url_prefix='')

@db
@bp.route('/', methods=["GET", "POST"])
def iss():
    args = {}
    if request.method == "POST":
        lat = request.form['lat']
        lon = request.form['lon']
        args['success'] = True
        # TODO implement time finder logic
    return render_template('iss/iss.html', **args)