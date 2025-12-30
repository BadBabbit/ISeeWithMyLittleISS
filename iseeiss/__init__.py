import os
from flask import Flask

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
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
    from . import db
    db.init_app(app)
    from views import iss
    app.register_blueprint(iss.bp)
    return app