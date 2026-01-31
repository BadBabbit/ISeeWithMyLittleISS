import os
import sys
from flask import Flask
from flask_cors import CORS
import threading
import atexit

def create_app(test_config=None):
    # initial config
    app = Flask(__name__, instance_relative_config=True)
    CORS(app) # so that frontend can access backend api
    from .logging import init_app, configFromYaml
    init_app(app)
    if 'clear-logs' not in sys.argv:
        app.logger.handlers.clear() # remove flask's default handler, otherwsie we get duplicate loggers
        configFromYaml(app)

    app.debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.config.from_mapping( # FIXME this should come from the config file
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'iseeiss.sqlite'),
    )
    if test_config is None:
        # TODO
        pass
    else:   
        # TODO
        pass
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # initialise database
    from . import db
    db.init_app(app)

    # blueprints
    from .endpoints import iss, status
    app.register_blueprint(iss.bp)
    app.register_blueprint(status.bp)

    # initialise api daemon
    if 'run' in sys.argv:
        from .iss_api import iss_api_daemon
        stop_iss_api = threading.Event()
        t = threading.Thread(target=iss_api_daemon, name='ISS API Daemon', args=(app, stop_iss_api), daemon=True)
        t.start()

        # register shutdown handler that will be called on exit
        def shutdown_daemon():
            stop_iss_api.set()
            t.join(timeout=10)
        atexit.register(shutdown_daemon)

    atexit.register(app.logger.warning, 'SERVER SHUTTING DOWN.')
    return app
    