# Backend

Minimal FastAPI application served by Uvicorn. Its only endpoint is
`GET /api/health`, returning `{"status":"ok"}`.

Automatic documentation and OpenAPI routes are disabled to keep exactly one
endpoint. No database or application features are included.

## First-time setup (VS Code PowerShell terminal)

Use your existing Python installation (Python 3.10+). From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

If your installation uses the Windows Python launcher, replace only
`python -m venv .venv` with `py -m venv .venv`.

These commands call the virtual environment's Python directly, so activation
and PowerShell execution-policy changes are unnecessary. Keep the server
running while using the frontend. Stop it with Ctrl+C.

## Subsequent startup

From the repository root:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Verify the endpoint

Open http://127.0.0.1:8000/api/health, or use another terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

With the frontend running, also open http://127.0.0.1:5173/api/health to
verify the development proxy. Both URLs should return the same health status.

The initial assistant environment could not locate `python` or `py`, so the
backend was not executed there. Run these commands in your VS Code terminal
using your existing Python installation.
