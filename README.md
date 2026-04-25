# FinanceOS - Finance Dashboard

A full-stack finance dashboard with a REST API backend and a built-in SPA frontend. Built with Node.js, Express, SQLite via `better-sqlite3`, JWT auth with refresh token rotation, RBAC, financial record management, analytics, and an audit trail.

## Quick Start

Requirements:
- Node.js 18+
- npm 9+

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
copy .env.example .env

# 3. Seed demo data
npm run seed

# 4. Start the app
npm start
```

Open `http://localhost:3000`.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| admin | admin@finance.dev | Admin@1234 |
| analyst | analyst@finance.dev | Analyst@1234 |
| viewer | viewer@finance.dev | Viewer@1234 |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start with file watching |
| `npm test` | Run the integration test suite |
| `npm run seed` | Seed demo users, categories, and records |
| `npm run db:reset` | Reset the local SQLite database |

## Project Structure

```text
finance-api/
|- src/         backend app, routes, services, middleware
|- frontend/    SPA shell, CSS, and browser-side JavaScript
|- tests/       integration tests and custom runner
|- data/        SQLite database files (local only)
|- .env.example
|- package.json
```

The frontend is served directly by Express from the same app running the API.

## Architecture

```text
HTTP Request
  -> Rate Limiter
  -> Helmet / CORS / Request ID
  -> Route Handler
     -> authenticate
     -> authorize
     -> validators
     -> controller
  -> service layer
  -> SQLite
  -> audit logger
  -> uniform API response
```

## Role and Permission Model

| Permission | viewer | analyst | admin |
|------------|:------:|:-------:|:-----:|
| `profile:read` / `profile:update` | yes | yes | yes |
| `records:read` | yes | yes | yes |
| `categories:read` | yes | yes | yes |
| `dashboard:read` | yes | yes | yes |
| `records:create` / `records:update` | no | yes | yes |
| `categories:create` | no | yes | yes |
| `analytics:read` | no | yes | yes |
| `records:delete` | no | no | yes |
| `categories:update` / `categories:delete` | no | no | yes |
| `users:*` | no | no | yes |
| `audit:read` | no | no | yes |

## API Overview

Base path: `/api/v1`

Main areas:
- `/auth` for register, login, refresh, logout, current user, and password change
- `/users` for admin user management
- `/records` for financial record CRUD
- `/categories` for category CRUD
- `/dashboard` for overview, summaries, trends, and insights
- `/audit` for admin audit access
- `/health` for liveness and database health

All responses use a consistent JSON shape with `success`, `message`, `data`, and optional `errors` or `pagination`.

## Data Model

Core tables:
- `users`
- `refresh_tokens`
- `categories`
- `financial_records`
- `audit_logs`

Financial records are soft-deleted. Audit entries are append-only.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | App environment |
| `JWT_SECRET` | dev default | Access token secret |
| `JWT_EXPIRES_IN` | `24h` | Access token TTL |
| `JWT_REFRESH_SECRET` | dev default | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `DB_PATH` | `./data/finance.db` | SQLite file path |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate-limit window |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `CORS_ORIGIN` | `http://localhost:3001` | Allowed CORS origin |

Change the JWT secrets before any real deployment.

## Running Tests

```bash
npm test
```

The test suite uses an in-memory SQLite database and currently covers auth flows, RBAC, records, categories, dashboard analytics, audit access, validation, and security headers.

## Notes

- This repository also includes [SETUP.md](./SETUP.md) for an additional setup walkthrough.
- The frontend should be opened through `http://localhost:3000`, not via `file:///...`.
