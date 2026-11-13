"""Insert the checked-in fictional snapshot without overwriting existing rows."""
import argparse
import json
from pathlib import Path
from database import DEFAULT_DATABASE_PATH, connect_database, initialize_database, database_counts

COLUMNS = {
    'swimmers': ('id', 'name'),
    'seasons': ('id', 'name', 'start_date', 'end_date'),
    'class_schedule_entries': ('id', 'swimmer_id', 'weekday', 'start_time', 'end_time', 'label'),
    'meets': ('id', 'name', 'meet_date', 'season_id'),
    'events': ('id', 'name'),
    'results': ('id', 'swimmer_id', 'meet_id', 'event_id', 'time_seconds'),
    'team_events': ('id', 'event_type', 'title', 'weekday', 'start_time', 'end_time'),
}


def seed_database(database_path=DEFAULT_DATABASE_PATH):
    data = json.loads(Path(__file__).with_name('seed_data.json').read_text(encoding='utf-8'))
    initialize_database(database_path)
    with connect_database(database_path) as connection:
        for table, columns in COLUMNS.items():
            sql = (f'INSERT INTO {table} ({", ".join(columns)}) '
                   f'VALUES ({", ".join("?" for _ in columns)}) ON CONFLICT(id) DO NOTHING')
            connection.executemany(sql, [tuple(row[column] for column in columns) for row in data[table]])
    return database_counts(database_path)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--database', default=DEFAULT_DATABASE_PATH)
    print(seed_database(parser.parse_args().database))
