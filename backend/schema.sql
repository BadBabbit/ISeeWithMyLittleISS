DROP TABLE IF EXISTS iss;

CREATE TABLE iss (
    id INTEGER PRIMARY KEY,
    timestamp INTEGER NOT NULL, --unix epoch
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL
);