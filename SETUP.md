# Setup Guide

## Prerequisites

- **Node.js >= 22.5** — uses the built-in `node:sqlite` module (no C++ compilation needed)
- **npm** — included with Node.js

Check your version:
```bash
node --version
# Should print v22.5.0 or higher
```

Download latest LTS if needed: https://nodejs.org

---

## Installation

### 1. Navigate to the project folder

```bash
# The folder that contains package.json
cd finance-api
```

### 2. Install dependencies

```bash
npm install
```

All packages are pure JavaScript — no native compilation step.

### 3. Configure environment

```bash
# Windows (PowerShell)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

The defaults in `.env` work out of the box for local development. For any real deployment, change both `JWT_SECRET` and `JWT_REFRESH_SECRET` to long random strings.

### 4. Seed demo data

```bash
npm run seed
```

This creates the SQLite database at `data/finance.db` and populates it with:
- 4 demo users (admin, 2 analysts, viewer)
- 11 categories
- ~99 financial records across 12 months

### 5. Start the server

```bash
# Development — auto-restarts on file changes
npm run dev

# Production
npm start
```

Open **http://localhost:3000** in your browser.

---

## Demo Login Credentials

| Role    | Email                  | Password      |
|---------|------------------------|---------------|
| admin   | admin@finance.dev      | Admin@1234    |
| analyst | analyst@finance.dev    | Analyst@1234  |
| viewer  | viewer@finance.dev     | Viewer@1234   |

The **admin** account has access to all pages including User Management and Audit Log.  
The **analyst** account can create and edit records and categories.  
The **viewer** account has read-only access.

---

## Resetting the Database

> Stop the server first — SQLite locks the file while the process is running.

```bash
# Stop the server (Ctrl+C), then:
npm run db:reset
npm run seed
```

`db:reset` deletes `data/finance.db`. `seed` recreates it with fresh demo data.

---

## Running Tests

Tests use an in-memory SQLite database — nothing is written to disk.

```bash
npm test
```

---

## Available Scripts

| Command            | Description                                      |
|--------------------|--------------------------------------------------|
| `npm run dev`      | Start with `--watch` (auto-restart on changes)   |
| `npm start`        | Start in production mode                         |
| `npm test`         | Run the full integration test suite              |
| `npm run seed`     | Populate the database with 12 months of demo data|
| `npm run db:reset` | Delete the database file (server must be stopped)|

---

## Project Layout (quick reference)

```
finance-api/
├── src/          # Backend — Express app, routes, services, middleware
├── frontend/     # Frontend — HTML, CSS, JS (served by Express at /)
├── data/         # SQLite database file (auto-created)
├── tests/        # Integration tests
├── .env          # Local config (copy from .env.example)
└── package.json
```

The backend and frontend run on the **same port (3000)**. Express serves the SPA from `frontend/` and all API routes under `/api/v1/`.

---

## Windows / PowerShell Notes

PowerShell does not support `&&` to chain commands. Run each command on its own line:

```powershell
# Wrong
npm run db:reset && npm run seed

# Correct
npm run db:reset
npm run seed
```

Use `;` if you want them on one line in PowerShell:

```powershell
npm run db:reset; npm run seed
```

---

## Troubleshooting

**`node --version` shows < 22.5**  
Download the latest LTS from https://nodejs.org and reinstall.

**`Error: EBUSY: resource busy or locked` on db:reset**  
The server is still running. Stop it with `Ctrl+C` first, then run `npm run db:reset`.

**`FOREIGN KEY constraint failed` during seed**  
The database has stale data. Stop the server, run `npm run db:reset`, then `npm run seed`.

**Page loads but charts are blank**  
Chart.js is bundled locally at `frontend/js/chart.umd.min.js`. If the file is missing, re-clone the repo or download it:
```powershell
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js" -OutFile "frontend/js/chart.umd.min.js"
```

**CSP errors in browser console**  
The Content Security Policy is configured in `src/app.js` via Helmet. The current policy allows `'unsafe-inline'` for scripts to support the inline event handlers in the frontend. Do not revert to the default `helmet()` call without the custom CSP directives.
