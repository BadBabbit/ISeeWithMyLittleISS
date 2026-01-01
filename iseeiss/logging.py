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

def configFromYaml():
    # Clear existing handlers to prevent duplicates
    root = logging.getLogger()
    if root.handlers:
        for handler in root.handlers[:]:
            root.removeHandler(handler)
    
    config.dictConfig({
        "version": 1,
        "disable_existing_loggers": True,
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
                "filename": LOG_FILE_NAME,
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