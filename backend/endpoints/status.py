""" Endpoints for status routes.
"""

from flask import (
    Blueprint,
    abort,
    request,
    jsonify
)

bp = Blueprint('status', __name__, url_prefix='/status')

@bp.route('/', methods=["GET"])
def status():
    """ Simple status endpoint to verify the api is running.
    """
    return jsonify({
        "status": "ok",
        "version": "0.0.0" # TODO get from config
    })