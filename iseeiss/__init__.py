import os
from flask import Flask, g
import threading
import atexit
import logging

def create_app(test_config=None):
    # initial config
    from .logging import configFromYaml
    configFromYaml()
    app.logger.handlers.clear() # remove flask's default handler, otherwsie we get duplicate loggers
    app = Flask(__name__, instance_relative_config=True)
    
    app.debug = True # TODO remove before deploying to prod
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
    from .views import iss

    # blueprints
    app.register_blueprint(iss.bp)

    # initialise api daemon
    from .iss_api import iss_api_daemon
    stop_iss_api = threading.Event()
    t = threading.Thread(target=iss_api_daemon, name='ISS API Daemon', args=(app, stop_iss_api), daemon=True)
    t.start()
    
    # register shutdown handler that will be called on exit
    def shutdown_daemon():
        stop_iss_api.set()
        t.join(timeout=10)
    
    atexit.register(shutdown_daemon)
    return app
