# FinanceOS — Finance Dashboard

A full-stack finance dashboard with a REST API backend and a built-in SPA frontend. Built with **Node.js + Express + built-in SQLite (`node:sqlite`)** — zero native compilation required.

Features JWT auth with refresh token rotation, RBAC (viewer / analyst / admin), financial records CRUD, category management, dashboard analytics with charts, and an audit trail.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Role & Permission Model](#role--permission-model)
5. [API Reference](#api-reference)
6. [Data Models](#data-models)
7. [Environment Variables](#environment-variables)
8. [Running Tests](#running-tests)
9. [Design Decisions](#design-decisions)

---

## Quick Start

> Requires **Node.js >= 22.5**. Check with `node --version`.

```bash
# 1. Install dependencies
cd finance-api
npm install

# 2. Configure environment
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

# 3. Seed demo data
npm run seed

# 4. Start the server
npm run dev
```

Open **http://localhost:3000** — the backend serves the frontend directly.

### Demo credentials

| Role    | Email                  | Password      |
|---------|------------------------|---------------|
| admin   | admin@finance.dev      | Admin@1234    |
| analyst | analyst@finance.dev    | Analyst@1234  |
| viewer  | viewer@finance.dev     | Viewer@1234   |

### Available scripts

| Command          | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Start with `--watch` (auto-restart)      |
| `npm start`      | Start in production mode                 |
| `npm test`       | Run integration test suite               |
| `npm run seed`   | Populate DB with 12 months of demo data  |
| `npm run db:reset` | Wipe the database (stop server first) |

> **Note:** Run `npm run db:reset` only when the server is stopped — SQLite locks the file while the process is running.

---

## Project Structure

```
finance-api/
├── src/
│   ├── app.js                    # Express app (middleware, routes, static serving)
│   ├── server.js                 # Process entry point + graceful shutdown
│   ├── config/
│   │   ├── index.js              # Centralised env config
│   │   ├── database.js           # SQLite init, schema, WAL pragmas
│   │   └── permissions.js        # RBAC matrix — single source of truth
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── authorize.js          # Permission enforcement
│   │   ├── validate.js           # express-validator error collector
│   │   ├── errorHandler.js       # Global error + 404 handlers
│   │   └── requestId.js          # X-Request-ID tracing header
│   ├── validators/               # Input schemas per resource
│   ├── controllers/              # Thin HTTP adapters
│   ├── services/                 # All business logic + DB access
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── record.service.js
│   │   ├── category.service.js
│   │   ├── dashboard.service.js
│   │   └── audit.service.js
│   ├── routes/                   # Express routers
│   └── utils/
│       ├── ApiResponse.js        # Uniform JSON response shape
│       ├── audit.js              # Append-only audit writer
│       ├── logger.js             # Structured JSON logger
│       ├── pagination.js         # Pagination + sort helpers
│       ├── seed.js               # Demo data loader
│       └── resetDb.js            # Wipe DB for a fresh start
├── frontend/
│   ├── index.html                # SPA shell
│   ├── css/app.css               # All styles
│   └── js/
│       ├── api.js                # Centralised HTTP client + token refresh
│       ├── utils.js              # Shared helpers (format, toast, modal)
│       ├── components.js         # Reusable UI (charts, pagination, fields)
│       ├── router.js             # Hash-based SPA router
│       ├── chart.umd.min.js      # Chart.js (bundled locally, no CDN)
│       └── pages/
│           ├── dashboard.js
│           ├── records.js
│           ├── categories.js
│           ├── users.js
│           ├── audit.js
│           └── profile.js
├── tests/
│   ├── helpers.js                # Shared setup + token factories
│   ├── run.js                    # Custom test runner
│   ├── auth.test.js
│   ├── users.test.js
│   ├── records.test.js
│   ├── categories.test.js
│   ├── dashboard.test.js
│   └── health.test.js
├── data/
│   └── finance.db                # SQLite database (auto-created on first run)
├── .env                          # Local environment (not committed)
├── .env.example                  # Template
└── package.json
```

---

## Architecture

```
HTTP Request
     │
     ▼
[Rate Limiter]
     │
     ▼
[Helmet CSP / CORS / RequestID]
     │
     ▼
[Route Handler]
     ├── [authenticate]    ← Verify JWT, attach user to req
     ├── [authorize]       ← Check role × permission matrix
     ├── [validators]      ← Schema + business rule validation
     └── [controller]      ← Delegates to service
                │
                ▼
         [Service Layer]   ← All business logic + DB queries
                │
                ▼
      [node:sqlite]        ← WAL mode, prepared statements
                │
                ▼
         [Audit Logger]    ← Append-only, non-blocking
                │
                ▼
         [ApiResponse]     ← Uniform JSON shape on every response
```

The frontend is served as static files by the same Express process — no separate dev server needed.

---

## Role & Permission Model

| Permission | viewer | analyst | admin |
|---|:---:|:---:|:---:|
| `profile:read` / `profile:update` | ✓ | ✓ | ✓ |
| `records:read` | ✓ | ✓ | ✓ |
| `categories:read` | ✓ | ✓ | ✓ |
| `dashboard:read` | ✓ | ✓ | ✓ |
| `records:create` / `records:update` | — | ✓ | ✓ |
| `categories:create` | — | ✓ | ✓ |
| `analytics:read` (insights) | — | ✓ | ✓ |
| `records:delete` | — | — | ✓ |
| `categories:update` / `categories:delete` | — | — | ✓ |
| `users:*` | — | — | ✓ |
| `audit:read` | — | — | ✓ |

Enforced via `authorize(permission)` middleware. The full matrix lives in `src/config/permissions.js`.

---

## API Reference

All responses follow this shape:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "errors": []
}
```

Paginated responses include:

```json
{
  "pagination": {
    "page": 1, "limit": 20, "total": 99,
    "totalPages": 5, "hasNext": true, "hasPrev": false
  }
}
```

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | Public | Get access + refresh tokens |
| POST | `/register` | Public | Create a new account |
| POST | `/refresh` | Public | Rotate refresh token |
| POST | `/logout` | Bearer | Revoke refresh token |
| GET | `/me` | Bearer | Current user + permissions |
| PUT | `/change-password` | Bearer | Change own password |
| PUT | `/profile` | Bearer | Update own name |

### Users — `/api/v1/users` *(admin only)*

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List users — params: `role`, `status`, `search`, `page`, `limit` |
| POST | `/` | Create user |
| GET | `/:id` | Get user |
| PUT | `/:id` | Update role / status / name |
| DELETE | `/:id` | Delete user |

### Records — `/api/v1/records`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | viewer+ | List records |
| POST | `/` | analyst+ | Create record |
| GET | `/:id` | viewer+ | Get single record |
| PUT | `/:id` | analyst+ | Update record |
| DELETE | `/:id` | admin | Soft delete |
| GET | `/export` | analyst+ | Download CSV |

Query params: `type`, `category_id`, `date_from`, `date_to`, `amount_min`, `amount_max`, `search`, `sort_by`, `sort_dir`, `page`, `limit`

### Categories — `/api/v1/categories`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | viewer+ | List all |
| POST | `/` | analyst+ | Create |
| GET | `/:id` | viewer+ | Get single |
| PUT | `/:id` | admin | Update |
| DELETE | `/:id` | admin | Delete (blocked if records exist) |

### Dashboard — `/api/v1/dashboard`

All require auth. Insights require `analyst+`. All accept `?date_from=&date_to=`.

| Path | Access | Description |
|------|--------|-------------|
| `/overview` | viewer+ | All sections in one call |
| `/summary` | viewer+ | Income / expense / balance totals |
| `/categories` | viewer+ | Category-wise totals |
| `/trends/monthly` | viewer+ | Monthly income + expense |
| `/trends/weekly` | viewer+ | Weekly trends |
| `/recent` | viewer+ | Latest transactions |
| `/insights` | analyst+ | Savings rate, top categories, ratios |

### Audit — `/api/v1/audit` *(admin only)*

| Path | Params |
|------|--------|
| GET `/` | `action`, `resource`, `user_id`, `date_from`, `date_to`, `page`, `limit` |

### Health — `/health`

```
GET /health  →  { "status": "ok", "db": "ok" }
```

---

## Data Models

### users
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (UUID) | PK |
| email | TEXT | UNIQUE, case-insensitive |
| password_hash | TEXT | bcrypt cost 12 |
| full_name | TEXT | |
| role | TEXT | viewer / analyst / admin |
| status | TEXT | active / inactive / suspended |
| last_login_at | TEXT | ISO 8601, updated on login |

### financial_records
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (UUID) | PK |
| amount | REAL | CHECK > 0 |
| type | TEXT | income / expense |
| category_id | TEXT | FK → categories (nullable) |
| date | TEXT | YYYY-MM-DD |
| description | TEXT | |
| notes | TEXT | |
| tags | TEXT | JSON array |
| reference_no | TEXT | |
| status | TEXT | active / deleted (soft delete) |
| created_by | TEXT | FK → users |

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (UUID) | PK |
| name | TEXT | UNIQUE, case-insensitive |
| type | TEXT | income / expense / both |
| color | TEXT | hex (#RRGGBB) |
| icon | TEXT | identifier string |

### audit_logs
Immutable. Written on every create / update / delete. Stores JSON snapshots of old and new state.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | `development` / `production` / `test` |
| `JWT_SECRET` | — | Access token signing key (min 32 chars) |
| `JWT_EXPIRES_IN` | `24h` | Access token TTL |
| `JWT_REFRESH_SECRET` | — | Refresh token signing key |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `DB_PATH` | `./data/finance.db` | SQLite file path |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `CORS_ORIGIN` | `http://localhost:3001` | Allowed CORS origin |

> Change both JWT secrets before any real deployment.

---

## Running Tests

Tests run against an **in-memory SQLite database** — no file I/O, no cleanup needed.

```bash
npm test
```

Each test file resets and re-initialises the schema so every test starts from a clean state. Coverage includes auth flows, RBAC enforcement, record CRUD, dashboard aggregations, pagination, and security headers.

---

## Design Decisions

**SQLite over PostgreSQL** — WAL mode with proper indexes handles this data volume with sub-millisecond queries. No database server to run, fully self-contained. Switching to PostgreSQL only requires changing the DB adapter.

**Soft delete for records** — Financial history should never be destroyed. Records get `status = 'deleted'`; users are hard-deleted since they have no historical integrity requirement.

**JWT + refresh token rotation** — Short-lived access tokens (24h), long-lived refresh tokens (7d) stored as SHA-256 hashes. Tokens rotate on every use. Reuse after rotation triggers immediate revocation of all sessions for that user.

**Permissions as a matrix** — All access control derives from one object in `config/permissions.js`. The `authorize()` middleware is a pure lookup — no role-checking if/else chains scattered across routes.

**Chart.js bundled locally** — `frontend/js/chart.umd.min.js` is served from the same origin to avoid CDN tracking prevention issues in browsers like Edge/Firefox with enhanced privacy settings.

**Audit writes are non-blocking** — Wrapped in try/catch so an audit failure never breaks the actual business operation.
