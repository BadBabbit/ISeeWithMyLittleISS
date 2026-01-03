import click
import sys
import os
import glob
from flask import Flask, current_app
from logging import config
import logging
from .config import (
    LOG_FILE_NAME,
    LOG_FILE_LEVEL,
    LOG_FILE_MAX_BYTES,
    LOG_FILE_FORMATTER,
    LOG_CONSOLE_STREAM,
    LOG_CONSOLE_LEVEL,
    LOG_CONSOLE_FORMATTER,
    LOG_FORMAT
)

def init_app(app):
    """ initialises logging for the app
    """
    app.cli.add_command(clear_logs)

def configFromYaml(app: Flask):
    # clear existing handlers to prevent duplicates
    root = logging.getLogger()
    if root.handlers:
        for handler in root.handlers[:]: # shallow copy so we don't skip elements when clearing
            root.removeHandler(handler)

    log_dir = os.path.join(app.instance_path, os.path.dirname(LOG_FILE_NAME))
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    log_file = os.path.join(app.instance_path, LOG_FILE_NAME)
    
    try:
        config.dictConfig({
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": LOG_FORMAT,
                }
            },
            "handlers": {
                "console": {
                    "level": LOG_CONSOLE_LEVEL,
                    "class": "logging.StreamHandler",
                    "stream": LOG_CONSOLE_STREAM,
                    "formatter": LOG_CONSOLE_FORMATTER,
                },
                "file": {
                    "level": LOG_FILE_LEVEL,
                    "class": "logging.handlers.RotatingFileHandler",
                    "filename": log_file,
                    "formatter": LOG_FILE_FORMATTER,
                    "maxBytes": LOG_FILE_MAX_BYTES,
                    "backupCount": 3
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["console", "file"]
            },
        })
    except ValueError as e:
        print(f"Value error: {e}", file=sys.stderr)
        print(f"log dir: {log_dir}", file=sys.stderr)
        exit(1)

@click.command('clear-logs')
def clear_logs():
    log_dir = os.path.join(current_app.instance_path, os.path.dirname(LOG_FILE_NAME))
    for filename in glob.glob(os.path.join(log_dir, "*.log*")):
        os.remove(filename)
