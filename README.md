# Restaurant Automation SaaS + FinanceOS

The Restaurant Automation SaaS is now the primary app, with its React/Vite frontend and Express/MongoDB backend. The existing FinanceOS dashboard remains available as a linked, separately authenticated finance app backed by Express and SQLite.

## Current Status

- Restaurant app: `http://localhost:5173`
- Restaurant API: `http://localhost:5000/api/v1`
- FinanceOS dashboard: `http://localhost:3000`
- FinanceOS API: `http://localhost:3000/api/v1`

## Features

- JWT login with refresh token rotation and logout
- Viewer, analyst, and admin roles
- User management for admins
- Financial records CRUD with filters, sorting, pagination, soft delete, and CSV export
- Recurring income and expense schedules with monthly/yearly cycles and ledger posting
- Category management with validation and protected deletes
- Dashboard analytics for totals, trends, categories, recent activity, and insights
- Restaurant-inspired herb-green and saffron FinanceOS theme with a clearer daily overview
- Daily sales and settlement reconciliation, exception review, closeout reports, and shift notes embedded in FinanceOS
- Audit log with filters, pagination, and detail view
- Admin Security Center with a persistent IP blocklist, security events, and active-control status
- Profile update and password change
- Security middleware with Helmet, CORS, rate limiting, request IDs, and consistent errors

## Restaurant Automation Features

- Restaurant discovery, menus, offers, and customer profiles
- Refreshed forest-green and saffron customer/admin interface across desktop and mobile
- Table reservations by date, time, party size, and seating preference; reservations no longer use QR scanning
- Direct reservation access replaces the customer scan buttons; QR table sessions remain available for dine-in ordering
- Customer ordering, live order tracking, feedback, and loyalty flows
- Kitchen order queue and batching, service-staff workflows, and cleaning tasks
- Restaurant administration for orders, tables, menu, inventory, staff, and reports
- Super-admin restaurant, subscription, and platform analytics

## Coming Next

- More detailed restaurant-to-finance reporting across the existing separate app accounts
- Smarter live reservation availability and table allocation
- Additional payment, notification, and delivery integrations
- Expanded operational analytics for kitchen and service teams

## Requirements

- Node.js 20 or newer recommended
- npm 9 or newer

The project uses `better-sqlite3`. If dependency installation fails because of native module tooling, use a current LTS Node.js release and reinstall dependencies.

## Quick Start

Install the apps' dependencies and create local environment files:

```powershell
npm install
npm install --prefix restaurant-saas
npm install --prefix finance-closeout
Copy-Item restaurant-saas/backend/.env.example restaurant-saas/backend/.env
Copy-Item restaurant-saas/frontend/.env.example restaurant-saas/frontend/.env
Copy-Item .env.example .env
```

Start MongoDB locally, then launch the integrated development environment:

```powershell
npm run dev
```

Open the restaurant app at `http://localhost:5173`. FinanceOS is also started at `http://localhost:3000` and is linked from the restaurant admin sidebar. The two apps retain separate accounts and databases; configure `VITE_FINANCE_DASHBOARD_URL` in `restaurant-saas/frontend/.env` when FinanceOS is hosted elsewhere.

The restaurant admin's Finance Dashboard route embeds FinanceOS in-app. FinanceOS includes Daily Closeout in its sidebar; closeout runs at `/closeout/` on the FinanceOS origin, so it does not need a separate service. CSV files are processed in the browser. Shift notes are stored in browser local storage, separated by FinanceOS account, and neither CSVs nor notes are synced to the server or other devices. Set `FRAME_ANCESTORS` in the FinanceOS `.env` to the exact trusted restaurant frontend origin in production; do not use `*`.

For a containerized MongoDB and restaurant app, first create the environment files above, then run `docker compose -f restaurant-saas/docker-compose.yml up --build`. Start FinanceOS separately with `npm run dev:finance` if needed.

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@finance.dev` | `Admin@1234` |
| Analyst | `analyst@finance.dev` | `Analyst@1234` |
| Viewer | `viewer@finance.dev` | `Viewer@1234` |

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the built restaurant app, FinanceOS, and the restaurant frontend preview |
| `npm run dev` | Start both apps for local development |
| `npm run dev:finance` | Start FinanceOS only |
| `npm test` | Run both apps' test suites |
| `npm run test:finance` | Run FinanceOS integration tests only |
| `npm run test:restaurant` | Run Restaurant SaaS backend tests only |
| `npm run test:closeout` | Run Daily Closeout unit tests only |
| `npm run build` | Build Daily Closeout and the restaurant backend and frontend |
| `npm run build:closeout` | Build the embedded closeout frontend |
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

The test suite uses an in-memory SQLite database for FinanceOS and includes the restaurant backend and Daily Closeout suites. FinanceOS tests cover health checks, auth flows, refresh token rotation, RBAC, users, records, categories, dashboard analytics, audit access, validation, and security headers.

## Project Structure

```text
finance-api/
|- frontend/    FinanceOS browser SPA and embedded Daily Closeout build
|- finance-closeout/ Daily Closeout source, tests, and build configuration
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
