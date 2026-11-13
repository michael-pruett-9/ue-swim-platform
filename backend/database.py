"""Isolated SQLite foundation; the API does not use this module yet."""
import argparse
from contextlib import contextmanager
from pathlib import Path
import sqlite3

DEFAULT_DATABASE_PATH = Path(__file__).parent / 'data' / 'prototype.sqlite3'
TABLES = ('swimmers', 'seasons', 'class_schedule_entries', 'meets', 'events', 'results', 'team_events')


@contextmanager
def connect_database(database_path=DEFAULT_DATABASE_PATH):
    """Open a transaction with foreign keys enabled; commit/rollback and close."""
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    connection.execute('PRAGMA foreign_keys = ON')
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database(database_path=DEFAULT_DATABASE_PATH):
    Path(database_path).parent.mkdir(parents=True, exist_ok=True)
    schema = Path(__file__).with_name('schema.sql').read_text(encoding='utf-8')
    with connect_database(database_path) as connection:
        connection.executescript(schema)
        # Correct only the original Step 10A results constraint in existing files.
        # SQLite requires rebuilding a table to remove a table-level UNIQUE.
        old_sql = connection.execute("SELECT sql FROM sqlite_master WHERE name = 'results'").fetchone()[0]
        if 'UNIQUE (swimmer_id, meet_id, event_id)' in old_sql:
            create_results = next(statement for statement in schema.split(';')
                                  if 'CREATE TABLE IF NOT EXISTS results (' in statement)
            connection.execute('BEGIN')
            connection.execute(create_results.replace('IF NOT EXISTS results (', 'results_upgrade ('))
            connection.execute('INSERT INTO results_upgrade SELECT id, swimmer_id, meet_id, event_id, time_seconds FROM results')
            connection.execute('DROP TABLE results')
            connection.execute('ALTER TABLE results_upgrade RENAME TO results')


def get_all_swimmers(database_path=DEFAULT_DATABASE_PATH):
    with connect_database(database_path) as connection:
        return [dict(row) for row in connection.execute('SELECT * FROM swimmers ORDER BY id')]


def get_swimmer_schedule(swimmer_id, database_path=DEFAULT_DATABASE_PATH):
    with connect_database(database_path) as connection:
        return [dict(row) for row in connection.execute('''
            SELECT * FROM class_schedule_entries WHERE swimmer_id = ?
            ORDER BY CASE weekday WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6 ELSE 7 END, start_time, id
        ''', (swimmer_id,))]


def get_swimmer_results(swimmer_id, database_path=DEFAULT_DATABASE_PATH):
    with connect_database(database_path) as connection:
        return [dict(row) for row in connection.execute('''
            SELECT r.*, e.name AS event, m.name AS meet, m.meet_date, s.name AS season
            FROM results r JOIN events e ON r.event_id = e.id
            JOIN meets m ON r.meet_id = m.id JOIN seasons s ON m.season_id = s.id
            WHERE r.swimmer_id = ? ORDER BY m.meet_date, e.name, r.id
        ''', (swimmer_id,))]


def database_counts(database_path=DEFAULT_DATABASE_PATH):
    with connect_database(database_path) as connection:
        # Table names come only from the fixed allowlist above.
        return {table: connection.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0] for table in TABLES}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--database', default=DEFAULT_DATABASE_PATH)
    parser.add_argument('--inspect', action='store_true', help='Read counts without initializing')
    args = parser.parse_args()
    if not args.inspect:
        initialize_database(args.database)
    print(database_counts(args.database))
