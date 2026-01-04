import sqlite3
import click
from functools import wraps
from flask import current_app, g

def init_app(app):
    """ initialises the db from the app initialiser.
    
        :param app: the host app.
    """
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    app.cli.add_command(view_iss_command)
    app.cli.add_command(clear_db_command)

def init_db():
    con = get_db()
    with current_app.open_resource('schema.sql') as f:
        con.executescript(f.read().decode('utf8'))
    con.close()

def get_iss_rows():
    con = get_db()
    rows = con.execute("SELECT * FROM iss;").fetchall()
    con.close()
    return rows

def clear_db():
    sql = get_db()
    sql.execute("DELETE FROM iss;")
    sql.close()

@click.command('init-db')
def init_db_command():
    """ command for clearing the existing data and create new tables.
    """
    init_db()
    click.echo('Initialized the database.')

@click.command('view-iss')
def view_iss_command():
    rows = get_iss_rows()
    click.echo(f"id,\ttimestamp,\t\tlat,\tlon")
    for r in rows:
        click.echo(f"{r['id']},\tr{r['timestamp']},\t\t{r['lat']},\t{r['lon']}")

@click.command('clear-db')
def clear_db_command():
    clear_db()
    click.echo("Database cleared.")

def get_db():
    con = sqlite3.connect(
        current_app.config['DATABASE'],
        detect_types=sqlite3.PARSE_DECLTYPES
    )
    con.row_factory = sqlite3.Row
    return con

def close_db(e=None):
    con = g.pop('con', None)
    if con is not None:
        con.close()

def db(f):
    """ db wrapper that can be applied to any function to grant it access to a db cursor, and then automatically closes the connection after the function has finished executing.

        e.g.:
        @db
        def myfunc(*args, **kwargs):
            sql.execute(...) # no need to create a connection, as it is provided by the wrapper
            ...
        
        :param f: the wrapped function.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        current_app.logger.info(f"{f.__name__} invoked with db decorator. creating connection.")
        con = get_db()
        res = f(sql=con.cursor(), *args, **kwargs)
        current_app.logger.info(f"{f.__name__} complete. closing db connection")
        con.close()
        return res
    return wrapper
    

    