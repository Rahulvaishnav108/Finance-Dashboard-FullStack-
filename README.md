# Finance Dashboard API

A production-grade REST API for a finance dashboard system, built with **Node.js + Express + SQLite (better-sqlite3)**. It implements JWT authentication with refresh token rotation, role-based access control (RBAC), full financial record management, and analytics-grade dashboard aggregations.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack & Choices](#tech-stack--choices)
3. [Project Structure](#project-structure)
4. [Role & Permission Model](#role--permission-model)
5. [API Reference](#api-reference)
6. [Data Models](#data-models)
7. [Setup & Running](#setup--running)
8. [Running Tests](#running-tests)
9. [Design Decisions & Tradeoffs](#design-decisions--tradeoffs)
10. [Assumptions](#assumptions)

---

## Architecture Overview

```
HTTP Request
     │
     ▼
[Rate Limiter]──────────────────────────────────────────┐
     │                                                  │ 429
     ▼                                                  │
[Helmet / CORS / RequestID]                             │
     │                                                  │
     ▼                                                  │
[Route Handler]                                         │
     │                                                  │
     ├──[authenticate]   ← Verify JWT, load user        │
     │        │                                         │
     ├──[authorize]      ← Check role × permission      │
     │        │                                         │
     ├──[validators]     ← Schema + business rules      │
     │        │                                         │
     ▼        ▼                                         │
[Controller]  ← thin, delegates everything              │
     │                                                  │
     ▼                                                  │
[Service Layer]  ← all business logic lives here        │
     │                                                  │
     ▼                                                  │
[SQLite via better-sqlite3]                             │
     │                                                  │
     ▼                                                  │
[Audit Logger]  ← append-only, non-blocking            │
     │                                                  │
     ▼                                                  │
[ApiResponse]  ← uniform JSON shape every time         │
```

**Layering:** Routes → Middleware chain → Controller → Service → Database. Each layer has one job. Services are the only place that touches the DB. Controllers only orchestrate. Middleware only gatekeeps.

---

## Tech Stack & Choices

| Layer | Choice | Reason |
|-------|--------|--------|
| Runtime | Node.js 18+ | Fast I/O, huge ecosystem, native ESM |
| Framework | Express 4 | Minimal, battle-tested, easy to reason about |
| Database | SQLite via `better-sqlite3` | Zero-setup, synchronous API, WAL mode for performance, perfect for this scope |
| Auth | JWT (access + refresh) | Stateless access tokens; refresh tokens persisted and rotated |
| Validation | `express-validator` | Declarative, chainable, test-friendly |
| Security | `helmet`, `cors`, `express-rate-limit` | Industry defaults |
| Password hashing | `bcryptjs` (cost 12) | Safe default; timing-safe comparison |
| UUID | `uuid` v4 | Unpredictable, globally unique IDs |
| Testing | `jest` + `supertest` | Integration tests against real in-memory SQLite |

---

## Project Structure

```
finance-api/
├── src/
│   ├── app.js                 # Express app factory (no listen)
│   ├── server.js              # Process entry; graceful shutdown
│   ├── config/
│   │   ├── index.js           # Centralised config (env vars)
│   │   ├── database.js        # SQLite init, schema, WAL pragmas
│   │   └── permissions.js     # RBAC matrix — single source of truth
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── authorize.js       # Permission enforcement
│   │   ├── validate.js        # express-validator error collector
│   │   ├── errorHandler.js    # Global error + 404 handlers
│   │   └── requestId.js       # X-Request-ID tracing
│   ├── validators/            # Input schemas per resource
│   ├── services/              # All business logic
│   │   ├── auth.service.js    # Login, refresh rotation, password
│   │   ├── user.service.js    # User CRUD + admin guards
│   │   ├── record.service.js  # Financial records + soft delete
│   │   ├── category.service.js
│   │   ├── dashboard.service.js  # All aggregation queries
│   │   └── audit.service.js
│   ├── controllers/           # Thin HTTP adapters
│   ├── routes/                # Express routers
│   └── utils/
│       ├── ApiResponse.js     # Uniform response shape
│       ├── audit.js           # Append-only audit writer
│       ├── logger.js          # Structured JSON logger
│       ├── pagination.js      # Pagination + sort helpers
│       ├── seed.js            # Demo data loader
│       └── resetDb.js         # Wipe database for fresh start
└── tests/
    ├── helpers.js             # Shared setup, user/token factories
    ├── auth.test.js
    ├── users.test.js
    ├── records.test.js
    ├── categories.test.js
    └── health.test.js
```

---

## Role & Permission Model

### Roles

| Role | Description |
|------|-------------|
| `viewer` | Read-only access to records and dashboard |
| `analyst` | Everything viewer can do + create/update records and categories |
| `admin` | Full access — user management, deletions, audit logs |

### Permissions Matrix

| Permission | viewer | analyst | admin |
|-----------|--------|---------|-------|
| `profile:read/update` | ✓ | ✓ | ✓ |
| `records:read` | ✓ | ✓ | ✓ |
| `categories:read` | ✓ | ✓ | ✓ |
| `dashboard:read` | ✓ | ✓ | ✓ |
| `records:create` | — | ✓ | ✓ |
| `records:update` | — | ✓ | ✓ |
| `categories:create` | — | ✓ | ✓ |
| `analytics:read` | — | ✓ | ✓ |
| `records:delete` | — | — | ✓ |
| `categories:update/delete` | — | — | ✓ |
| `users:*` | — | — | ✓ |
| `audit:read` | — | — | ✓ |

Enforced via `authorize(permission)` middleware. The matrix lives in `src/config/permissions.js` — one place to change, everywhere it applies.

---

## API Reference

All endpoints return:
```json
{
  "success": true | false,
  "message": "...",
  "data": { ... } | null,
  "errors": [ ... ]          // only on 422
}
```

Paginated responses additionally include:
```json
{
  "pagination": {
    "page": 1, "limit": 20, "total": 150,
    "totalPages": 8, "hasNext": true, "hasPrev": false
  }
}
```

---

### Auth  `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Get access + refresh tokens |
| POST | `/refresh` | Public | Rotate refresh token |
| POST | `/logout` | Bearer | Revoke refresh token |
| GET | `/me` | Bearer | Current user + permissions |
| PUT | `/change-password` | Bearer | Change own password |

**POST /login — Request**
```json
{ "email": "admin@finance.dev", "password": "Admin@1234" }
```
**POST /login — Response**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": { "id": "...", "email": "...", "role": "admin" }
  }
}
```

---

### Users  `/api/v1/users`  *(admin only, except own profile)*

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | admin | List users (filterable, paginated) |
| POST | `/` | admin | Create user |
| GET | `/:id` | admin or self | Get user |
| PUT | `/:id` | admin | Update role/status/name |
| DELETE | `/:id` | admin | Delete user |

**Query params for GET /:** `role`, `status`, `search`, `page`, `limit`, `sort_by`, `sort_dir`

---

### Financial Records  `/api/v1/records`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | viewer+ | List records |
| POST | `/` | analyst+ | Create record |
| GET | `/:id` | viewer+ | Get single record |
| PUT | `/:id` | analyst+ | Update record |
| DELETE | `/:id` | admin | Soft delete |

**Query params for GET /:**

| Param | Type | Description |
|-------|------|-------------|
| `type` | `income\|expense` | Filter by type |
| `category_id` | UUID | Filter by category |
| `date_from` | YYYY-MM-DD | Start of date range |
| `date_to` | YYYY-MM-DD | End of date range |
| `amount_min` | float | Minimum amount |
| `amount_max` | float | Maximum amount |
| `search` | string | Full-text on description/notes/reference |
| `page` | int | Page number (default 1) |
| `limit` | int | Page size (default 20, max 100) |
| `sort_by` | `amount\|date\|created_at\|type` | Sort field |
| `sort_dir` | `asc\|desc` | Sort direction |

**POST /records — Request**
```json
{
  "amount": 85000,
  "type": "income",
  "category_id": "uuid",
  "date": "2024-03-01",
  "description": "March salary",
  "notes": "Includes performance bonus",
  "tags": ["salary", "q1"],
  "reference_no": "PAY-2024-03"
}
```

---

### Categories  `/api/v1/categories`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | viewer+ | List all |
| POST | `/` | analyst+ | Create |
| GET | `/:id` | viewer+ | Get single |
| PUT | `/:id` | admin | Update |
| DELETE | `/:id` | admin | Delete (blocked if records exist) |

---

### Dashboard  `/api/v1/dashboard`

All require authentication. Insights require `analyst+`.

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/overview` | viewer+ | All sections in one call |
| GET | `/summary` | viewer+ | Total income, expense, balance |
| GET | `/categories` | viewer+ | Category-wise totals |
| GET | `/trends/monthly` | viewer+ | Monthly income/expense/net |
| GET | `/trends/weekly` | viewer+ | Weekly trends |
| GET | `/recent` | viewer+ | Latest N transactions |
| GET | `/insights` | analyst+ | Savings rate, top categories, ratios |

All accept optional `?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`.

**GET /summary — Response**
```json
{
  "data": {
    "total_income": 170000,
    "total_expenses": 45000,
    "net_balance": 125000,
    "total_records": 5,
    "income_count": 2,
    "expense_count": 3
  }
}
```

**GET /trends/monthly — Response**
```json
{
  "data": [
    { "month": "2024-01", "income": 80000, "expense": 25000, "net": 55000, "count": 3 },
    { "month": "2024-02", "income": 90000, "expense": 20000, "net": 70000, "count": 2 }
  ]
}
```

---

### Audit Log  `/api/v1/audit`  *(admin only)*

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Paginated audit trail |

**Query params:** `action`, `resource`, `user_id`, `date_from`, `date_to`, `page`, `limit`

---

### Health  `/health`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Liveness + DB check |

---

## Data Models

### users
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (UUID) | PK |
| email | TEXT | UNIQUE, NOCASE |
| password_hash | TEXT | bcrypt, cost 12 |
| full_name | TEXT | |
| role | TEXT | viewer / analyst / admin |
| status | TEXT | active / inactive / suspended |
| created_at | TEXT | ISO 8601 |
| last_login_at | TEXT | Updated on login |

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
| updated_by | TEXT | FK → users |

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (UUID) | PK |
| name | TEXT | UNIQUE, NOCASE |
| type | TEXT | income / expense / both |
| color | TEXT | hex (#RRGGBB) |
| icon | TEXT | identifier string |

### audit_logs
Immutable. Written on every create/update/delete. Stores JSON snapshots of old and new state.

---

## Setup & Running

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone and install
git clone <repo-url>
cd finance-api
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — change JWT secrets before any real deployment

# 3. Seed demo data
npm run seed

# 4. Start server
npm start
# → Running at http://localhost:3000
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment |
| `JWT_SECRET` | (change this!) | Access token signing key |
| `JWT_EXPIRES_IN` | 24h | Access token TTL |
| `JWT_REFRESH_SECRET` | (change this!) | Refresh token key |
| `JWT_REFRESH_EXPIRES_IN` | 7d | Refresh token TTL |
| `DB_PATH` | ./data/finance.db | SQLite file path |
| `RATE_LIMIT_MAX` | 100 | Requests per 15 min |

### Demo Users (after seed)

| Role | Email | Password |
|------|-------|----------|
| admin | admin@finance.dev | Admin@1234 |
| analyst | analyst@finance.dev | Analyst@1234 |
| viewer | viewer@finance.dev | Viewer@1234 |

---

## Running Tests

```bash
# All tests
npm test

# With coverage report
npm run test:coverage

# Single file
npx jest tests/auth.test.js
```

Tests use an **in-memory SQLite database** (`:memory:`) — no file I/O, no cleanup needed. Each `beforeEach` resets and re-initialises the schema so every test starts from a known clean state.

**Coverage areas:**
- Authentication flows (register, login, refresh rotation, password change)
- RBAC enforcement (403 for every role/resource combination that should be blocked)
- Financial record CRUD with all filter combinations
- Soft delete verification
- Category-type constraint enforcement
- Dashboard aggregations with date filtering
- Pagination, sorting, validation errors
- Security headers, request tracing, 404 handling

---

## Design Decisions & Tradeoffs

### Why SQLite?
The spec allows any persistence strategy. SQLite with WAL mode and proper indexes supports tens of thousands of records with sub-millisecond queries — more than sufficient for this scope. It removes operational overhead (no database server to run, no connection pooling) and makes the project fully self-contained. Migration to PostgreSQL would require only changing the DB adapter; all service code stays identical.

### Synchronous `better-sqlite3`
SQLite's disk I/O is the bottleneck, not thread contention. The synchronous API eliminates callback/promise complexity for every DB call without sacrificing throughput for this use case. For a high-concurrency production system, PostgreSQL with `pg` would be the appropriate switch.

### Soft Delete vs Hard Delete
Financial records are soft-deleted (status = 'deleted', deleted_at timestamp). This is standard in finance systems — you almost never truly destroy financial history. Users are hard-deleted because user accounts have no historical integrity requirement, and CASCADE cleans up refresh tokens automatically.

### JWT + Refresh Token Rotation
Access tokens are short-lived (24h). Refresh tokens are long-lived (7d), stored as SHA-256 hashes in the DB, and rotated on every use. If a refresh token is reused after rotation, all tokens for that user are immediately revoked (detect-and-burn strategy). Logout revokes the specific refresh token so other sessions remain valid.

### Permissions as a Matrix, Not per-route logic
All access control decisions derive from a single `PERMISSIONS` object in `config/permissions.js`. Adding a new permission means editing one place. The `authorize()` middleware is a pure lookup — no if/else role chains scattered across routes.

### Audit Log
Every mutating operation writes an append-only audit entry with before/after JSON snapshots. Audit writes use try/catch so an audit failure never breaks the actual operation. This is the correct tradeoff — a failed audit entry is preferable to a failed business operation.

### Category-Type Enforcement
A category typed as `expense` cannot be assigned to an `income` record and vice versa. Categories of type `both` work with either. This is enforced in the service layer (not just the DB) so error messages are clear and actionable.

---

## Assumptions

1. **Single organisation.** All users share the same pool of financial records and categories. Multi-tenancy is not in scope.

2. **Soft delete for records, hard delete for users.** Financial records retain historical value; user accounts do not need soft deletion for this scope.

3. **The `/register` endpoint is intentionally public.** In a real production system, you'd gate this behind an admin token or an invitation flow. For this assessment, it provides a convenient onboarding path alongside the seed script.

4. **Amounts are stored as REAL (float).** For a true production finance system, storing amounts as integer cents avoids floating-point precision issues. For this assessment scope, REAL with `ROUND(x, 2)` in all queries is sufficient.

5. **Tags stored as JSON text in SQLite.** SQLite 3.38+ has native JSON support but serialising to text is compatible with all versions and adequate for non-indexed tag filtering.

6. **Rate limits are per-IP** using Express's `req.ip`. Behind a reverse proxy, `app.set('trust proxy', 1)` should be enabled and `X-Forwarded-For` will be used correctly.
