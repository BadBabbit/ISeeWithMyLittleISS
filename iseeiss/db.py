import sqlite3

import click
from flask import current_app, g

def init_app(app):
    """ initialises the db from the app initialiser.
    
        :param app: the host app.
    """
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

def init_db():
    db = get_db()
    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))

@click.command('init-db')
def init_db_command():
    """ command for clearing the existing data and create new tables.
    """
    init_db()
    click.echo('Initialized the database.')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def db(f):
    """ db wrapper that can be applied to any function to grant it access to a db cursor, and then automatically closes the connection after the function has finished executing.

        e.g.:
        @db
        def myfunc(*args, **kwargs):
            db.insert(...) # no need to define db, as it is provided by the wrapper
            ...
        
        :param f: the wrapped function.
    """
    def wrapper(*args, **kwargs):
        get_db()
        res = f(*args, **kwargs)
        close_db()
        return res
    return wrapper
    

    