# Restaurant Automation SaaS — Final PRD + Full API Blueprint

## Product Summary

**Product Name:** Restaurant Automation
**Type:** Multi-tenant Restaurant Operating SaaS
**Primary Users:** Customer, Service Staff, Kitchen Staff, Cleaning Staff, Restaurant Admin, Super Admin

The platform automates the complete restaurant lifecycle:

```txt
table discovery
→ QR session entry
→ menu browsing
→ ordering
→ kitchen batching
→ serving
→ billing
→ payment
→ feedback
→ cleaning
→ table reuse
```

---

# 1. Core Product Rules

- Customer, Staff, Kitchen, and Cleaning systems are PWA-based.
- No Google Authentication.
- Authentication methods:
  - Customers: OTP-first (Name, Mobile, OTP). No password-based login. Email optional.
  - Staff / Admin roles: Email + Password + JWT.
- OTP acts as both login and recovery mechanism for customers.
- QR sessions are temporary and table-bound.
- Expired QR links cannot reopen old sessions.
- Session tied to:
  - table
  - restaurant
  - expiry
  - token
- One frontend codebase.
- One backend codebase.
- Role-based modular architecture.
- Super admin deployable separately.
- Strict RBAC enforced everywhere.

---

# 2. Roles

## Platform Role

- Super Admin

## Restaurant Roles

- Restaurant Admin
- Kitchen Staff
- Service Staff
- Cleaning Staff
- Customer

---

# 3. Frontend Architecture Tree

```txt
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers/
│   │
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── types/
│   │
│   ├── lib/
│   │   ├── api/
│   │   ├── env.ts
│   │   ├── socket.ts
│   │   └── queryClient.ts
│   │
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── tokenStore.ts
│   │   └── guards/
│   │
│   ├── layouts/
│   │   ├── CustomerLayout.tsx
│   │   ├── StaffLayout.tsx
│   │   ├── KitchenLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── SuperAdminLayout.tsx
│   │
│   ├── routes/
│   │   ├── customer.routes.tsx
│   │   ├── staff.routes.tsx
│   │   ├── kitchen.routes.tsx
│   │   ├── admin.routes.tsx
│   │   └── superAdmin.routes.tsx
│   │
│   ├── features/
│   │   ├── customer/
│   │   ├── staff/
│   │   ├── kitchen/
│   │   ├── cleaning/
│   │   ├── admin/
│   │   └── superAdmin/
│   │
│   ├── sockets/
│   ├── store/
│   ├── hooks/
│   ├── assets/
│   └── styles/
│
├── public/
├── .env.example
├── .gitignore
├── package.json
└── vite.config.ts
```

---

# 4. Backend Architecture Tree

```txt
backend/
├── src/
│   ├── server.ts
│   ├── app.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   └── logger.ts
│   │
│   ├── middleware/
│   │   ├── requireAuth.ts
│   │   ├── roleGuard.ts
│   │   ├── validate.ts
│   │   ├── errorHandler.ts
│   │   ├── requestId.ts
│   │   └── rateLimiters.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── restaurants/
│   │   ├── tables/
│   │   ├── tableSessions/
│   │   ├── reservations/
│   │   ├── queue/
│   │   ├── menu/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── kitchen/
│   │   ├── staff/
│   │   ├── cleaning/
│   │   ├── billing/
│   │   ├── payments/
│   │   ├── offers/
│   │   ├── loyalty/
│   │   ├── feedback/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   ├── inventory/
│   │   ├── uploads/
│   │   └── superAdmin/
│   │
│   ├── services/
│   ├── sockets/
│   ├── jobs/
│   ├── utils/
│   ├── types/
│   └── constants/
│
├── postman/
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

# 5. Tech Stack

## Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- Shadcn UI
- TanStack Query
- Axios
- React Hook Form
- Zod
- Framer Motion
- Socket.IO Client
- PWA

## Backend

- Node.js
- Express
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Zod
- helmet
- cors
- express-rate-limit
- express-mongo-sanitize
- socket.io
- node-cron
- nodemailer
- winston
- Sentry

---

# 6. Authentication Rules

## Allowed

- Email + Password
- Mobile + Password
- OTP Authentication

## Not Allowed

- Google OAuth
- Social Login

## Security

- JWT Access Token
- Refresh Token Rotation
- HttpOnly Cookie
- Session Tracking
- Device Tracking
- Role Guards
- Socket.IO Tenant & Role Validation
- Strict Tenant isolation on all protected routes
- Duplicate payment prevention and PaymentModel tracking

---

# 7. QR Session Rules

## QR Session Lifecycle

```txt
Scan QR
→ Create Session
→ Menu Access
→ Order Flow
→ Billing
→ Payment
→ Session Expired
→ Cleaning
→ Table Available
```

## Rules

- QR session tied to table.
- QR session tied to restaurant.
- Session automatically expires.
- Expired QR URLs blocked.
- No URL abuse allowed.
- Old session cannot be reopened.

## Error Example

```json
{
  "success": false,
  "error": {
    "code": "TABLE_SESSION_EXPIRED",
    "message": "Please scan another QR code."
  }
}
```

---

# 8. Customer Features

## Customer Panel

- QR Scan
- Table Session
- Menu Browsing
- Search
- Filters
- Veg/Non-Veg
- Cart
- Add-ons
- Order Placement
- Reorder
- Favorite Meals
- Smart Recommendations
- Live Order Tracking
- Waiter Request
- Water Request
- Cleaning Request
- Live Bill
- Coupon Apply
- Loyalty Rewards
- Payment
- Feedback
- Session Exit

---

# 9. Kitchen Features

## Kitchen Panel

- Live Orders
- Smart Queue
- Batch Cooking
- Batch Split
- Delay Handling
- Chef Load
- ETA Updates
- Availability Toggle
- Priority Override
- Kitchen Analytics

---

# 10. Service Staff Features

## Staff Panel

- Table Dashboard
- Reservation Handling
- Queue Handling
- Food Pickup
- Serving Workflow
- Billing Assistance
- Offer Assistance
- Customer Requests
- Escalation Handling

---

# 11. Cleaning Features

## Cleaning Panel

- Cleaning Tasks
- Table Cleanup
- Task Priority
- Task Completion
- Verification
- Table Availability Reset

---

# 12. Restaurant Admin Features

## Admin Panel

- Dashboard Analytics
- Table Management
- Floor Management
- Menu Management
- Offer Management
- Staff Management
- Shift Management
- Reservation Control
- Billing Reports
- Revenue Reports
- Inventory Tracking
- Loyalty Rules

---

# 13. Super Admin Features

## Super Admin Panel

- SaaS Management
- Tenant Monitoring
- Subscription Plans
- Feature Flags
- Platform Analytics
- Audit Logs
- Restaurant Approval
- Restaurant Suspension

---

# 14. Query Params vs URL Params

## URL Params

Used for single resources.

```http
GET /orders/:id
PATCH /tables/:id
DELETE /offers/:id
```

## Query Params

Used for:
- filtering
- pagination
- analytics
- searching

```http
GET /orders?status=READY
GET /tables?floor=1
GET /menu/items?veg=true
GET /analytics/revenue?from=2026-01-01&to=2026-01-31
```

---

# 15. API Blueprint

## Base URL

```txt
/api/v1
```

---

# 15.1 Auth APIs

```http
POST /auth/register
POST /auth/login
POST /auth/request-otp
POST /auth/verify-otp
POST /auth/refresh
POST /auth/logout
GET  /auth/me
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/sessions
DELETE /auth/sessions/:sessionId
```

---

# 15.2 Public APIs

```http
GET /public/restaurants/:slug
GET /public/menu/:restaurantId
GET /public/menu/:restaurantId?veg=true
GET /public/menu/:restaurantId?category=pizza
GET /public/menu/:restaurantId?search=pasta

POST /public/table-session/validate
POST /public/table-session/create

GET /public/reservations/availability
POST /public/queue/join
```

---

# 15.3 Customer APIs

```http
GET /customer/session
PATCH /customer/session/extend
POST /customer/session/end

GET /customer/menu/categories
GET /customer/menu/items
GET /customer/menu/items?veg=true
GET /customer/menu/items?category=starter
GET /customer/menu/items?available=true
GET /customer/menu/items?popular=true
GET /customer/menu/items?recommended=true
GET /customer/menu/items?search=pizza
GET /customer/menu/items/:id

GET /customer/cart
POST /customer/cart/items
PATCH /customer/cart/items/:itemId
DELETE /customer/cart/items/:itemId
DELETE /customer/cart

POST /customer/orders
GET /customer/orders
GET /customer/orders?status=PREPARING
GET /customer/orders?page=1&limit=10
GET /customer/orders/:id
POST /customer/orders/:id/reorder
POST /customer/orders/:id/cancel

POST /customer/requests/waiter
POST /customer/requests/water
POST /customer/requests/cutlery
POST /customer/requests/cleaning
POST /customer/requests/help

GET /customer/bill
POST /customer/bill/request

POST /customer/bill/coupon
DELETE /customer/bill/coupon/:couponId

POST /customer/payments/create
POST /customer/payments/verify
GET /customer/payments/:paymentId/status

POST /customer/feedback
GET /customer/feedback

GET /customer/loyalty
GET /customer/offers
GET /customer/offers/eligibility
```

---

# 15.4 Staff APIs

```http
GET /staff/tables
GET /staff/tables?status=AVAILABLE
GET /staff/tables?floor=1
GET /staff/tables?section=VIP
GET /staff/tables/:id

PATCH /staff/tables/:id/assign
PATCH /staff/tables/:id/reserve
PATCH /staff/tables/:id/occupy

GET /staff/queue
GET /staff/queue/:id
PATCH /staff/queue/:id/priority

GET /staff/reservations
GET /staff/reservations/:id
PATCH /staff/reservations/:id/check-in

GET /staff/orders/ready
PATCH /staff/orders/:id/pick
PATCH /staff/orders/:id/serve

GET /staff/requests
PATCH /staff/requests/:id/accept
PATCH /staff/requests/:id/complete

POST /staff/issues/escalate
```

---

# 15.5 Kitchen APIs

```http
GET /kitchen/dashboard

GET /kitchen/orders
GET /kitchen/orders?status=PREPARING
GET /kitchen/orders?priority=HIGH
GET /kitchen/orders?table=12
GET /kitchen/orders?batch=true

GET /kitchen/orders/:id

PATCH /kitchen/orders/:id/accept
PATCH /kitchen/orders/:id/start
PATCH /kitchen/orders/:id/ready
PATCH /kitchen/orders/:id/delay
PATCH /kitchen/orders/:id/reject

GET /kitchen/batches
GET /kitchen/batches/:id

POST /kitchen/batches
PATCH /kitchen/batches/:id

GET /kitchen/load
GET /kitchen/performance
```

---

# 15.6 Cleaning APIs

```http
GET /cleaning/tasks
GET /cleaning/tasks?status=PENDING
GET /cleaning/tasks?priority=HIGH

GET /cleaning/tasks/:id

PATCH /cleaning/tasks/:id/start
PATCH /cleaning/tasks/:id/complete
PATCH /cleaning/tasks/:id/verify
```

---

# 15.7 Admin APIs

```http
GET /admin/restaurant/overview

GET /admin/restaurant/settings
PATCH /admin/restaurant/settings

POST /admin/tables
GET /admin/tables
GET /admin/tables/:id
PATCH /admin/tables/:id
DELETE /admin/tables/:id

POST /admin/tables/bulk

POST /admin/tables/:id/qr
GET /admin/tables/:id/qr

POST /admin/menu/categories
GET /admin/menu/categories

POST /admin/menu/items
GET /admin/menu/items
GET /admin/menu/items?available=true
GET /admin/menu/items?category=starter
GET /admin/menu/items?search=burger

GET /admin/menu/items/:id

PATCH /admin/menu/items/:id
DELETE /admin/menu/items/:id

PATCH /admin/menu/items/:id/availability

POST /admin/menu/items/:id/image

POST /admin/staff
GET /admin/staff
GET /admin/staff/:id
PATCH /admin/staff/:id
DELETE /admin/staff/:id

POST /admin/staff/shifts

GET /admin/staff/attendance
GET /admin/staff/performance

POST /admin/offers
GET /admin/offers
GET /admin/offers/:id
PATCH /admin/offers/:id
DELETE /admin/offers/:id

GET /admin/loyalty/rules
POST /admin/loyalty/rules

GET /admin/billing/revenue
GET /admin/billing/tax
GET /admin/billing/orders
GET /admin/billing/discounts
GET /admin/billing/payments

GET /admin/analytics/revenue
GET /admin/analytics/revenue?from=2026-01-01&to=2026-01-31
GET /admin/analytics/revenue?groupBy=day

GET /admin/analytics/peak-hours
GET /admin/analytics/repeat-customers
GET /admin/analytics/kitchen
GET /admin/analytics/table-utilization
GET /admin/analytics/customer-retention

GET /admin/inventory
POST /admin/inventory
PATCH /admin/inventory/:id
GET /admin/inventory/alerts
```

---

# 15.8 Super Admin APIs

```http
GET /super-admin/platform/overview

GET /super-admin/restaurants
GET /super-admin/restaurants?status=ACTIVE
GET /super-admin/restaurants?plan=PRO
GET /super-admin/restaurants?search=pizza

GET /super-admin/restaurants/:id

PATCH /super-admin/restaurants/:id/approve
PATCH /super-admin/restaurants/:id/suspend
DELETE /super-admin/restaurants/:id

POST /super-admin/plans
GET /super-admin/plans
PATCH /super-admin/plans/:id

GET /super-admin/analytics/revenue
GET /super-admin/analytics/tenants

GET /super-admin/system/monitoring

GET /super-admin/audit-logs
GET /super-admin/audit-logs?actorId=123
GET /super-admin/audit-logs?action=DELETE
GET /super-admin/audit-logs?from=2026-01-01&to=2026-01-10

GET /super-admin/feature-flags
PATCH /super-admin/feature-flags/:id
```

---

# 16. Shared Utility APIs

```http
GET /notifications
PATCH /notifications/:id/read
PATCH /notifications/read-all

POST /uploads

GET /search?q=pizza

GET /health
GET /ready
GET /version
```

---

# 17. API Response Structure

## Success

```json
{
  "success": true,
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed"
  }
}
```

---

# 18. Error Codes

```txt
VALIDATION_ERROR
INVALID_REQUEST
UNAUTHORIZED
TOKEN_EXPIRED
TOKEN_INVALID
REFRESH_TOKEN_INVALID
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMIT_EXCEEDED
TABLE_SESSION_EXPIRED
TABLE_ALREADY_ASSIGNED
ORDER_NOT_MODIFIABLE
PAYMENT_FAILED
INTERNAL_ERROR
```

---

# 19. Real-Time Socket Events

```txt
table:status-updated
queue:updated
reservation:created
order:new
order:status-updated
kitchen:batch-updated
staff:request-new
billing:updated
payment:confirmed
cleaning:task-new
notification:new
offer:updated
```

---

# 20. MongoDB Collections

```txt
users
restaurants
restaurantMembers
roles
permissions
tables
tableSessions
reservations
queues
menuCategories
menuItems
menuVariants
itemAddons
carts
orders
orderItems
kitchenBatches
bills
payments
offers
loyaltyRules
couponRedemptions
feedback
notifications
staffRequests
cleaningTasks
inventoryItems
auditLogs
subscriptions
platformMetrics
```

---

# 21. Deployment Architecture

## Development

```txt
localhost:5173
```

All role modules available internally.

---

## Production

```txt
app.domain.com
→ customer + staff + kitchen + admin

admin.domain.com
→ super admin only
```

Same frontend codebase.
Separate deployment exposure.

---

# 22. Security Checklist

- JWT Authentication
- Refresh Rotation
- RBAC
- Ownership Checks
- Rate Limiting
- Helmet
- CORS
- Mongo Sanitize
- Session Expiry
- QR Abuse Prevention
- HTTPS
- Secure Cookies
- Audit Logs
- Validation Middleware

---

# 23. Acceptance Criteria

Project considered complete only if:

- Customer can scan QR and create session
- Expired QR sessions blocked
- Kitchen batching works
- Staff workflows functional
- Cleaning workflow functional
- Admin analytics functional
- Super admin SaaS controls functional
- Query filtering functional
- Real-time updates functional
- Secure deployment architecture functional
