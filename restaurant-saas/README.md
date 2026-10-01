# 🍽️ Restaurant Automation SaaS

A modern multi-tenant Restaurant Automation SaaS platform designed to streamline restaurant operations from QR-based customer ordering to kitchen batching, service management, billing, loyalty systems, analytics, and platform-level SaaS administration.

---

# 🚀 Vision

Restaurant Automation is not just a digital menu system.

It is a complete restaurant operating ecosystem that automates:

- QR dining sessions
- Table lifecycle management
- Reservations & waiting queues
- Real-time kitchen workflows
- Waiter coordination
- Billing & payments
- Loyalty systems
- Offers & discounts
- Analytics dashboards
- SaaS-level restaurant management

---

# ✨ Core Features

## 👤 Customer PWA

- QR-based table session
- Temporary dining session
- Digital menu
- Veg / Non-Veg filters
- Smart recommendations
- Add to cart
- Reorder previous meals
- Live order tracking
- Waiter assistance requests
- Loyalty rewards
- Coupon system
- Online payment
- Feedback system

---

## 👨‍🍳 Kitchen PWA

- Real-time order queue
- Smart kitchen batching
- Priority handling
- Chef workload tracking
- Preparation ETA management
- Batch optimization
- Delay handling
- Item availability management

---

## 🧑‍💼 Service Staff PWA

- Table management
- Reservation handling
- Queue handling
- Food serving workflow
- Customer request handling
- Billing assistance
- Issue escalation

---

## 🧹 Cleaning Staff PWA

- Cleaning task queue
- Table turnover workflow
- Priority-based cleaning
- Availability reset

---

## 🛠️ Restaurant Admin Dashboard

- Revenue analytics
- Table management
- Menu management
- Offer management
- Staff management
- Inventory tracking
- Billing reports
- Loyalty management
- Customer retention analytics

---

## 🌐 Super Admin Dashboard

- SaaS tenant management
- Subscription management
- Restaurant approval/suspension
- Platform analytics
- Audit logs
- Feature flag management
- System monitoring

---

# 🔒 Security Features

- JWT Authentication
- Refresh Token Rotation
- RBAC (Role-Based Access Control)
- Session Isolation
- QR Session Expiry
- URL Abuse Prevention
- Rate Limiting
- Helmet Security
- Mongo Sanitize
- Secure Cookies
- Audit Logging

---

# 📲 QR Session Security

Each table QR generates a temporary session tied to:

- Restaurant
- Table
- Expiry timestamp
- Session token

Expired sessions automatically become invalid.

If someone tries to reuse the same URL:

```json
{
  "success": false,
  "error": {
    "code": "TABLE_SESSION_EXPIRED",
    "message": "Please scan another QR code."
  }
}
```

This prevents QR abuse and unauthorized table access.

---

# 🧱 Tech Stack

## Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- Shadcn UI
- TanStack Query
- Axios
- Framer Motion
- Socket.IO Client
- PWA

---

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT
- Socket.IO
- Zod
- Winston
- Node Cron

---

# 🧩 Monorepo Workspace Architecture

This project uses npm workspaces for dependency hoisting and unified monorepo management.

Shared development dependencies such as:

- TypeScript
- Node Types
- ESLint
- Prettier

are hoisted to the root workspace for version consistency and reproducible builds.

---

## Workspace Structure

```txt
project/
├── backend/
├── frontend/
├── node_modules/
├── package.json
└── package-lock.json
```

---

# 🏗️ Frontend Structure

```txt
frontend/
├── src/
│   ├── app/
│   ├── shared/
│   ├── lib/
│   ├── auth/
│   ├── layouts/
│   ├── routes/
│   ├── features/
│   │   ├── customer/
│   │   ├── staff/
│   │   ├── kitchen/
│   │   ├── cleaning/
│   │   ├── admin/
│   │   └── superAdmin/
│   ├── sockets/
│   ├── store/
│   └── hooks/
```

---

# ⚙️ Backend Structure

```txt
backend/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   ├── services/
│   ├── sockets/
│   ├── jobs/
│   ├── utils/
│   └── constants/
```

---

# 🔄 Real-Time Features

Socket.IO powered live updates:

- Order updates
- Kitchen queue updates
- Billing updates
- Reservation updates
- Notification updates
- Table state updates
- Staff request updates

---

# 📊 API Architecture

REST API architecture with:

- URL params
- Query params
- Pagination
- Filtering
- Analytics endpoints
- Role-based access

Example:

```http
GET /orders?status=READY&page=1&limit=20
```

---

# 👥 Roles

| Role | Description |
|---|---|
| Customer | QR dining & ordering |
| Service Staff | Table & serving workflow |
| Kitchen Staff | Food preparation workflow |
| Cleaning Staff | Table turnover workflow |
| Restaurant Admin | Restaurant operations |
| Super Admin | SaaS platform management |

---

# 🌍 Deployment Architecture

## Restaurant App

```txt
app.domain.com
```

Contains:

- Customer
- Kitchen
- Staff
- Restaurant Admin

---

## Super Admin App

```txt
admin.domain.com
```

Contains:

- Super Admin only

Same frontend codebase.
Separate deployment exposure.

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/Rahulvaishnav108/Restaurant-automation-Saas.git

cd Restaurant-automation-Saas
```

---

## Install Dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

Create:

```txt
backend/.env
```

---

## Backend Environment Configuration

```env
# ======================================================
# SERVER CONFIG
# ======================================================

PORT=5000
NODE_ENV=development

API_PREFIX=/api/v1

CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# ======================================================
# DATABASE
# ======================================================

MONGODB_URI=your_mongodb_connection_string

# ======================================================
# AUTH
# ======================================================

JWT_SECRET=your_random_jwt_secret
JWT_REFRESH_SECRET=your_random_refresh_secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12

# ======================================================
# SESSION & COOKIE
# ======================================================

COOKIE_SECRET=your_cookie_secret

COOKIE_DOMAIN=localhost

ACCESS_COOKIE_NAME=ra_access_token
REFRESH_COOKIE_NAME=ra_refresh_token

SESSION_EXPIRES_IN_MINUTES=120

# ======================================================
# QR SESSION SECURITY
# ======================================================

QR_SESSION_EXPIRES_IN_MINUTES=90

TABLE_SESSION_TOKEN_LENGTH=64

SESSION_IDLE_TIMEOUT_MINUTES=20
SESSION_RATE_LIMIT_MAX_REQUESTS=5

# ======================================================
# RATE LIMITING
# ======================================================

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

AUTH_RATE_LIMIT_MAX_REQUESTS=10

# ======================================================
# SOCKET.IO
# ======================================================

SOCKET_CORS_ORIGIN=http://localhost:5173

# ======================================================
# FILE UPLOADS
# ======================================================

UPLOAD_PROVIDER=local

UPLOAD_PATH=uploads

MAX_FILE_SIZE_MB=10

# ======================================================
# EMAIL / SMTP
# ======================================================

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525

SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password

SMTP_FROM=noreply@restaurant-saas.com

# ======================================================
# LOGGING
# ======================================================

LOG_LEVEL=debug

# ======================================================
# SECURITY
# ======================================================

HELMET_ENABLED=true

TRUST_PROXY=false

# ======================================================
# MONITORING
# ======================================================

SENTRY_DSN=

# ======================================================
# REDIS (Future Scaling)
# ======================================================

REDIS_URL=redis://localhost:6379

# ======================================================
# PAYMENT (Future)
# ======================================================

STRIPE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# ======================================================
# FEATURE FLAGS
# ======================================================

ENABLE_SWAGGER=true
ENABLE_SOCKET_LOGS=true
ENABLE_REQUEST_LOGS=true

# ======================================================
# DOCKER
# ======================================================

DOCKER_ENV=local

# ======================================================
# SUPER ADMIN
# ======================================================

SUPER_ADMIN_EMAIL=admin@restaurant-saas.com
SUPER_ADMIN_PASSWORD=change_this_password
```

---

# ▶️ Run Development Server

## Run Backend

```bash
npm run dev --workspace backend
```

---

## Run Frontend

```bash
npm run dev --workspace frontend
```

---

## Run Entire Workspace

```bash
npm run dev
```

---

# 🐳 Docker Development

## Start Containers

```bash
docker-compose up --build
```

---

## Stop Containers

```bash
docker-compose down
```

---

# 🧪 Verification

## Typecheck

```bash
npm run typecheck
```

---

## Backend Verification

```bash
npm run verify:phase1 --workspace backend
```

---

# 📌 Project Status

🚧 In Active Development

---

# 🤝 Contributors

Built and maintained by the Restaurant Automation SaaS Team in collaboration with Graphura Pvt. Ltd.
