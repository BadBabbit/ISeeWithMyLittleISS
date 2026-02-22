DROP TABLE IF EXISTS iss;

CREATE TABLE iss (
    id INTEGER PRIMARY KEY,
    timestamp INTEGER NOT NULL, --unix epoch
    tle_line_1 TEXT NOT NULL,
    tle_line_2 TEXT NOT NULL
);