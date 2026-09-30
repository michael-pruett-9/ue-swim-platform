# Frontend

Minimal React application using Vite, JavaScript, and plain CSS. Displays the
project title and checks `GET /api/health` once when the page loads.

## Local startup (VS Code PowerShell terminal)

Requires Node.js 22.12+ and npm. From the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Keep this terminal running. Vite exits if port
5173 is already occupied. Stop the server with Ctrl+C.

Start the backend in a second terminal using [its instructions](../backend/README.md).
The page shows `Backend: Connected` when the health request succeeds. If the
backend is unavailable, start it and refresh the page. Requests time out after
five seconds.

`vite.config.js` forwards `/api` requests to http://127.0.0.1:8000 without
changing the path. This proxy is for local development; production hosting
is outside this setup's scope.

## Build check

```powershell
npm run build
```

This creates generated files in `dist/`, which are ignored by Git.
