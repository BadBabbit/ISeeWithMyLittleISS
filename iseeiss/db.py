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
    sql = get_db()
    with current_app.open_resource('schema.sql') as f:
        sql.executescript(f.read().decode('utf8'))

@click.command('init-db')
def init_db_command():
    """ command for clearing the existing data and create new tables.
    """
    init_db()
    click.echo('Initialized the database.')

def get_db():
    if 'sql' not in g:
        g.sql = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.sql.row_factory = sqlite3.Row
    return g.sql

def close_db(e=None):
    sql = g.pop('sql', None)
    if sql is not None:
        sql.close()

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
    

    