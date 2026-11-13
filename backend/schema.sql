CREATE TABLE IF NOT EXISTS swimmers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'historical'))
);
CREATE TABLE IF NOT EXISTS seasons (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    CHECK (start_date < end_date)
);
CREATE TABLE IF NOT EXISTS class_schedule_entries (
    id TEXT PRIMARY KEY NOT NULL,
    swimmer_id TEXT NOT NULL REFERENCES swimmers(id),
    weekday TEXT NOT NULL CHECK (weekday IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    start_time TEXT NOT NULL CHECK (start_time GLOB '[0-2][0-9]:[0-5][0-9]' AND start_time < '24:00'),
    end_time TEXT NOT NULL CHECK (end_time GLOB '[0-2][0-9]:[0-5][0-9]' AND end_time < '24:00'),
    label TEXT,
    CHECK (start_time < end_time),
    UNIQUE (swimmer_id, weekday, start_time, end_time)
);
CREATE TABLE IF NOT EXISTS meets (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    meet_date TEXT NOT NULL,
    season_id TEXT NOT NULL REFERENCES seasons(id),
    UNIQUE (name, meet_date, season_id)
);
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY NOT NULL,
    swimmer_id TEXT NOT NULL REFERENCES swimmers(id),
    meet_id TEXT NOT NULL REFERENCES meets(id),
    event_id TEXT NOT NULL REFERENCES events(id),
    time_seconds REAL NOT NULL CHECK (typeof(time_seconds) IN ('real', 'integer') AND time_seconds > 0)
);
CREATE TABLE IF NOT EXISTS team_events (
    id TEXT PRIMARY KEY NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('PRACTICE', 'MEET', 'TEAM EVENT')),
    title TEXT NOT NULL,
    weekday TEXT NOT NULL CHECK (weekday IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    start_time TEXT NOT NULL CHECK (start_time GLOB '[0-2][0-9]:[0-5][0-9]' AND start_time < '24:00'),
    end_time TEXT NOT NULL CHECK (end_time GLOB '[0-2][0-9]:[0-5][0-9]' AND end_time < '24:00'),
    CHECK (start_time < end_time)
);
