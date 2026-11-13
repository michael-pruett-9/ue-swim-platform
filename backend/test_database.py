import sqlite3
import tempfile
import unittest
from pathlib import Path

from database import (TABLES, initialize_database, connect_database, database_counts,
                      get_all_swimmers, get_swimmer_schedule, get_swimmer_results)
from seed_database import seed_database


class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / 'test.sqlite3'
        initialize_database(self.path)

    def insert_swimmer(self):
        with connect_database(self.path) as db:
            db.execute("INSERT INTO swimmers (id, name) VALUES ('test', 'Fictional Test Swimmer')")

    def test_initialization_creates_tables(self):
        with connect_database(self.path) as db:
            names = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertEqual(names, set(TABLES))

    def test_initialization_preserves_existing_data(self):
        self.insert_swimmer()
        initialize_database(self.path)
        self.assertEqual(len(get_all_swimmers(self.path)), 1)

    def test_swimmer_insert_retrieve_and_persist(self):
        self.insert_swimmer()
        swimmer = get_all_swimmers(self.path)[0]
        self.assertEqual(swimmer['name'], 'Fictional Test Swimmer')
        self.assertEqual(swimmer['status'], 'active')
        self.assertTrue(swimmer['created_at'])

    def test_foreign_keys_enabled_on_each_connection(self):
        for _ in range(2):
            with connect_database(self.path) as db:
                self.assertEqual(db.execute('PRAGMA foreign_keys').fetchone()[0], 1)
                with self.assertRaises(sqlite3.IntegrityError):
                    db.execute("INSERT INTO class_schedule_entries VALUES ('bad','missing','Monday','09:00','09:50',NULL)")

    def test_schedule_association(self):
        self.insert_swimmer()
        with connect_database(self.path) as db:
            db.execute("INSERT INTO class_schedule_entries VALUES ('class','test','Monday','09:00','09:50','Mock Math')")
        self.assertEqual(get_swimmer_schedule('test', self.path)[0]['label'], 'Mock Math')
        self.assertEqual(get_swimmer_schedule('missing', self.path), [])

    def test_result_relationships(self):
        self.insert_swimmer()
        with connect_database(self.path) as db:
            db.execute("INSERT INTO seasons VALUES ('season','2026-27','2026-07-01','2027-06-30')")
            db.execute("INSERT INTO meets VALUES ('meet','Mock Meet','2026-09-05','season')")
            db.execute("INSERT INTO events VALUES ('event','50 Freestyle')")
            db.execute("INSERT INTO results VALUES ('result','test','meet','event',23.41)")
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute("DELETE FROM swimmers WHERE id='test'")
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute("INSERT INTO results VALUES ('invalid','test','missing','event',24)")
        result = get_swimmer_results('test', self.path)[0]
        self.assertEqual((result['event'], result['meet'], result['season'], result['time_seconds']),
                         ('50 Freestyle', 'Mock Meet', '2026-27', 23.41))

    def test_seed_swimmers(self):
        seed_database(self.path)
        swimmers = get_all_swimmers(self.path)
        self.assertEqual(len(swimmers), 20)
        self.assertTrue(all(row['name'].startswith('Mock Swimmer ') for row in swimmers))

    def test_multiple_swims_same_event_and_meet(self):
        seed_database(self.path)
        with connect_database(self.path) as db:
            original = tuple(db.execute('SELECT * FROM results ORDER BY id LIMIT 1').fetchone())
            second = ('additional-swim', *original[1:])
            db.execute('INSERT INTO results VALUES (?,?,?,?,?)', second)
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute('INSERT INTO results VALUES (?,?,?,?,?)', second)
        self.assertEqual(seed_database(self.path)['results'], 433)
        self.assertIn('additional-swim', [row['id'] for row in get_swimmer_results(original[1], self.path)])

    def test_original_schema_upgrade_preserves_all_results(self):
        seed_database(self.path)
        with connect_database(self.path) as db:
            before = [tuple(row) for row in db.execute('SELECT * FROM results ORDER BY id')]
            sql = db.execute("SELECT sql FROM sqlite_master WHERE name='results'").fetchone()[0]
            old_sql = sql[:sql.rfind(')')] + ', UNIQUE (swimmer_id, meet_id, event_id))'
            db.execute('DROP TABLE results')
            db.execute(old_sql)
            db.executemany('INSERT INTO results VALUES (?,?,?,?,?)', before)
        initialize_database(self.path)
        initialize_database(self.path)
        with connect_database(self.path) as db:
            self.assertEqual([tuple(row) for row in db.execute('SELECT * FROM results ORDER BY id')], before)
            db.execute('INSERT INTO results VALUES (?,?,?,?,?)', ('extra', *before[0][1:]))
            self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])

    def test_seed_schedules(self):
        seed_database(self.path)
        self.assertEqual(database_counts(self.path)['class_schedule_entries'], 158)
        for swimmer in get_all_swimmers(self.path):
            self.assertTrue(get_swimmer_schedule(swimmer['id'], self.path))

    def test_seed_seasons_and_results(self):
        counts = seed_database(self.path)
        self.assertEqual(counts, dict(zip(TABLES, (20, 2, 158, 6, 14, 432, 6))))
        for swimmer in get_all_swimmers(self.path):
            results = get_swimmer_results(swimmer['id'], self.path)
            self.assertEqual({r['season'] for r in results}, {'2025-26', '2026-27'})
            self.assertEqual([r['meet_date'] for r in results], sorted(r['meet_date'] for r in results))
        with connect_database(self.path) as db:
            self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])

    def test_reseed_preserves_rows_and_unrelated_data(self):
        counts = seed_database(self.path)
        with connect_database(self.path) as db:
            db.execute("UPDATE swimmers SET status='historical' WHERE id='mock-001'")
        self.insert_swimmer()
        counts['swimmers'] += 1
        self.assertEqual(seed_database(self.path), counts)
        self.assertEqual(get_all_swimmers(self.path)[0]['status'], 'historical')

    def test_constraints_reject_invalid_values(self):
        self.insert_swimmer()
        with connect_database(self.path) as db:
            for day, start, end in [('Funday','09:00','10:00'), ('Monday','24:00','25:00'), ('Monday','10:00','09:00')]:
                with self.subTest(day=day, start=start), self.assertRaises(sqlite3.IntegrityError):
                    db.execute('INSERT INTO class_schedule_entries VALUES (?,?,?,?,?,?)', ('bad','test',day,start,end,None))
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute("UPDATE swimmers SET status='invalid'")

    def test_transaction_rollback(self):
        with self.assertRaises(sqlite3.IntegrityError):
            with connect_database(self.path) as db:
                db.execute("INSERT INTO swimmers (id,name) VALUES ('rollback','Mock Rollback')")
                db.execute("INSERT INTO swimmers (id,name) VALUES ('rollback','Duplicate')")
        self.assertEqual(get_all_swimmers(self.path), [])


if __name__ == '__main__':
    unittest.main()
