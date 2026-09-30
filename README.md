# FinanceOS - Finance Dashboard

FinanceOS is a full-stack finance dashboard with an Express REST API, SQLite storage, JWT authentication, role-based access control, analytics, CSV export, audit logging, and a built-in browser SPA served from the same Node.js app.

## Current Status

- Backend API: complete
- Frontend SPA: complete
- Demo database seed: available
- Integration tests: passing
- Local app URL: `http://localhost:3000`

## Features

- JWT login with refresh token rotation and logout
- Viewer, analyst, and admin roles
- User management for admins
- Financial records CRUD with filters, sorting, pagination, soft delete, and CSV export
- Recurring income and expense schedules with monthly/yearly cycles and ledger posting
- Category management with validation and protected deletes
- Dashboard analytics for totals, trends, categories, recent activity, and insights
- Audit log with filters, pagination, and detail view
- Admin Security Center with a persistent IP blocklist, security events, and active-control status
- Profile update and password change
- Security middleware with Helmet, CORS, rate limiting, request IDs, and consistent errors

## Requirements

- Node.js 20 or newer recommended
- npm 9 or newer

The project uses `better-sqlite3`. If dependency installation fails because of native module tooling, use a current LTS Node.js release and reinstall dependencies.

## Quick Start

From this folder:

```powershell
npm install
npm run seed
npm start
```

Open:

```text
http://localhost:3000
```

The Express server serves both the frontend and the API. API routes live under `/api/v1`.

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@finance.dev` | `Admin@1234` |
| Analyst | `analyst@finance.dev` | `Analyst@1234` |
| Viewer | `viewer@finance.dev` | `Viewer@1234` |

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the production-style local server |
| `npm run dev` | Start with Node watch mode |
| `npm test` | Run the integration test suite |
| `npm run seed` | Seed demo users, categories, and records |
| `npm run db:reset` | Delete the local SQLite database |

## Smoke Check

After starting the server, you can verify the app quickly:

```powershell
(Invoke-WebRequest -UseBasicParsing http://localhost:3000/).StatusCode
(Invoke-RestMethod http://localhost:3000/health).status
```

Expected output:

```text
200
healthy
```

## Running Tests

```powershell
npm test
```

The test suite uses an in-memory SQLite database. It covers health checks, auth flows, refresh token rotation, RBAC, users, records, categories, dashboard analytics, audit access, validation, and security headers.

## Project Structure

```text
finance-api/
|- frontend/    Browser SPA: HTML, CSS, and page modules
|- src/         Express app, routes, controllers, services, middleware, config
|- tests/       Integration test runner and test coverage
|- data/        Local SQLite database files, created at runtime
|- .env.example Local environment template
|- package.json Scripts and dependencies
```

## Architecture

```text
Browser / API Client
  -> Express app
  -> Helmet, CORS, rate limit, request ID
  -> authenticate / authorize / validate
  -> controller
  -> service
  -> SQLite
  -> audit logger
  -> uniform JSON response
```

## Role Permissions

| Capability | Viewer | Analyst | Admin |
| --- | :---: | :---: | :---: |
| Read own profile | yes | yes | yes |
| Update own profile | yes | yes | yes |
| Read records, categories, dashboard | yes | yes | yes |
| Create/update records | no | yes | yes |
| Export records | no | yes | yes |
| Create categories | no | yes | yes |
| Read analytics insights | no | yes | yes |
| Delete records | no | no | yes |
| Update/delete categories | no | no | yes |
| Manage users | no | no | yes |
| Read audit log | no | no | yes |

## API Overview

Base path: `/api/v1`

| Area | Routes |
| --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/profile`, `/auth/change-password` |
| Users | `/users`, `/users/:id` |
| Records | `/records`, `/records/:id`, `/records/export` |
| Categories | `/categories`, `/categories/:id` |
| Recurring | `/recurring`, `/recurring/:id`, `/recurring/:id/record-payment` |
| Security (admin) | `/security/overview`, `/security/blocked-ips`, `/security/blocked-ips/:id` |
| Dashboard | `/dashboard/overview`, `/dashboard/summary`, `/dashboard/categories`, `/dashboard/trends/monthly`, `/dashboard/trends/weekly`, `/dashboard/recent`, `/dashboard/insights` |
| Audit | `/audit` |
| Health | `/health` |

Responses use a consistent shape:

```json
{
  "success": true,
  "message": "Request completed",
  "data": {},
  "pagination": {}
}
```

## Data Model

Core tables:

- `users`
- `refresh_tokens`
- `categories`
- `financial_records`
- `recurring_transactions`
- `blocked_ips`
- `security_events`
- `audit_logs`

Financial records use soft delete. Audit entries are append-only.

## Environment Variables

Local development works with defaults, but production should use explicit secrets.

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Runtime environment |
| `JWT_SECRET` | dev default | Access token signing secret |
| `JWT_EXPIRES_IN` | `24h` | Access token lifetime |
| `JWT_REFRESH_SECRET` | dev default | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `DB_PATH` | `./data/finance.db` | SQLite database path |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `CORS_ORIGIN` | `http://localhost:3001` | Allowed CORS origin |
| `TRUST_PROXY` | `0` | Trusted reverse-proxy hops; enable only behind a known proxy |

Copy the template when you want local overrides:

```powershell
copy .env.example .env
```

## Production Checklist

- Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` values
- Set `NODE_ENV=production`
- Point `DB_PATH` at persistent storage
- Configure `CORS_ORIGIN` for the deployed frontend origin if separated
- Set `TRUST_PROXY` to the exact trusted proxy-hop count when deployed behind a reverse proxy; do not trust arbitrary forwarded headers
- Run `npm test` before deployment
- Seed only intentional demo or initial production data

## Troubleshooting

- If the page is blank, open the app through `http://localhost:3000`, not directly from the filesystem.
- If login fails, run `npm run seed` and try the demo credentials again.
- If database reset fails on Windows, stop the server first, then run `npm run db:reset`.
- If port 3000 is busy, set `PORT` in `.env` or stop the process using that port.
