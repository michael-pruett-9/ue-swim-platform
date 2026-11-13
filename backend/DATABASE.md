# Local SQLite foundation (Step 10A)

This isolated persistence layer uses only Python's built-in sqlite3. FastAPI and
React still use their existing behavior; no application endpoint reads SQLite.

Run these commands in PowerShell from the repository root:

```powershell
.\backend\.venv\Scripts\python.exe -B backend/database.py
.\backend\.venv\Scripts\python.exe -B backend/seed_database.py
.\backend\.venv\Scripts\python.exe -B backend/database.py --inspect
.\backend\.venv\Scripts\python.exe -B -m unittest discover -s backend -p "test_*.py" -v
```

The default file is `backend/data/prototype.sqlite3`, resolved relative to the
module, independent of the terminal directory. Generated database and journal
files in that folder are gitignored. Both CLIs accept `--database PATH` for an
alternate file. Tests use disposable temporary directories, never the dev file.

Read helpers can be inspected from the repository root:

```powershell
.\backend\.venv\Scripts\python.exe -B -c "import sys; sys.path.insert(0, 'backend'); from database import get_all_swimmers, get_swimmer_schedule, get_swimmer_results; print(get_all_swimmers()); print(get_swimmer_schedule('mock-001')); print(get_swimmer_results('mock-001'))"
```

## Schema and connections

`schema.sql` is the exact schema. All IDs are non-null TEXT primary keys.
Foreign keys are enabled on every connection; deletes are restricted by default.
The connection context manager commits on success, rolls back on error, and
always closes. Initialization creates missing tables and preserves data. For a
database created by the original Step 10A schema, it also removes the old
swimmer/meet/event uniqueness constraint by transactionally rebuilding only
the results table and copying every result unchanged. Rerun database.py to apply
this targeted correction; repeat calls are safe. This is not a general migration system.

Tables: swimmers, seasons, class_schedule_entries, meets, events, results,
team_events. Schedules and results reference swimmers; meets reference seasons;
results reference meets and events. Each result has its own unique primary key;
multiple results may share a swimmer, meet, and event, even with identical times.
No round/heat field or behavior is introduced yet. Swimmer names are not unique.
Swimmer status defaults to active, allowing active/historical values for future
work; status has no effect on current UI or scheduling. Team events remain an
undated sample week, independent of performance meets.

## Fictional seed snapshot

`seed_data.json` is a checked-in snapshot derived from the existing frontend mock
modules by `export_seed.mjs`. Regenerate intentionally after mock-data updates:

```powershell
node backend/export_seed.mjs
```

No JavaScript source parsing is used. Normal initialization, seeding, and tests
need only Python; Node is needed only to regenerate the snapshot. Review the
JSON diff before committing it. Dates use ISO format; sample season boundaries
are July 1 through June 30. Meet IDs use dates because the current fictional
data has exactly one performance meet per date; revise that mapping before
supporting multiple same-day meets. Class IDs use swimmer/day/start/end.

Fresh seed counts: 20 swimmers, 2 seasons, 158 class entries, 6 meets, 14 events,
432 results, 6 team events. Seeding inserts in foreign-key order in one transaction.
ON CONFLICT(id) DO NOTHING preserves existing rows, including changed names or
statuses. Other constraint violations raise an error and roll back all inserts.
Reseeding does not update or delete old rows; this is not a synchronization/import
tool. Use a separate fresh database path when reviewing a regenerated snapshot.

No real athlete data, authentication, general migration framework, frontend integration, roster
editing, or meet-import workflow is implemented here. Cross-table season-date
consistency and class-overlap checks are not database constraints in this step.
