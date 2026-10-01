# Implementation Plan — Restaurant Subscription & Plan Management (backend)

## Goal
Complete every remaining `- [ ]` item in `backend/TODO.md` for the handbook module:
- Upgrade / Downgrade / Expire subscription lifecycle + state transitions + event history
- Dedicated `RestaurantSubscription` entity (source-of-truth)
- Enforce plan limits at runtime across tables/orders/reservations/queue/staff/inventory
- System-wide usage aggregation + tie to limit checks + notifications/admin signals
- Auto limit enforcement + 80% threshold alerts + consistent flow behavior
- Notifications: 80% usage alerts, plan expiry, limit exceeded, upgrade recs, renewal reminders
- Billing integration: link subscription billing creation to subscription entity + payment records + auto-renew via scheduler & webhook-driven transitions
- Technical improvements: transactions, race condition fixes, end-to-end `ObjectId` relationships

---

## Information Gathered (from read-only discovery)
### Existing wiring
- Subscription module exists with:
  - `SubscriptionModel`, `SubscriptionEventModel`, `SubscriptionPaymentModel`
  - `subscriptions.service.ts` implements:
    - create/list/get/update/status/activate/cancel/renew
    - usage increment + usage report
    - sends 80% warning and limit exceeded notifications inside `incrementUsage`
- Payments integration exists:
  - Razorpay webhook endpoint exists and updates `PaymentModel`
  - Webhook finalizes Bills/Orders for **table sessions**, not subscriptions
- Background jobs orchestrator starts:
  - `expireSessions`, `dailySalesReport`, `reservationReminder`
  - No subscription expiry/renewal job is present
- Runtime flows for enforcement points:
  - `orders.service.ts`, `reservations.service.ts`, `queue.service.ts`, `tables.service.ts`, `staff.service.ts`, `inventory.service.ts` have no subscription-limit checks
- Plan/feature flags CRUD exists under `superAdmin.service.ts`.

### Confirmed TODO gaps
- Upgrade/downgrade/expire/history + dedicated `RestaurantSubscription` entity not implemented.
- System-wide usage aggregation + runtime limit enforcement + full notification set not implemented.
- Subscription billing linkage + auto-renewal via scheduler/webhooks not implemented.

---

## Plan

### Step 1 — Add/confirm `RestaurantSubscription` as source-of-truth
**Files**
- `backend/src/modules/subscriptions/subscriptions.model.ts`
- (new) `backend/src/modules/subscriptions/restaurantSubscription.model.ts` (recommended for clarity)

**Actions**
- Create `RestaurantSubscription` model to hold:
  - `restaurantId`, `planId (ObjectId)`, `billingCycle`, `autoRenew`, `payment provider refs`
  - `status`, `currentPeriodStart/currentPeriodEnd`, `seats`
  - `usageCounters` (or keep in existing subscription usage)
- Migrate/alias old `SubscriptionModel` usage or rename to avoid breaking endpoints.

**Definition of Done**
- `RestaurantSubscription` becomes the canonical entity used by lifecycle, billing, enforcement.

---

### Step 2 — Subscription History model + writers
**Files**
- `backend/src/modules/subscriptions/subscriptions.model.ts`
- (new or extend) `backend/src/modules/subscriptions/subscriptionsHistory.model.ts`
- Update `subscriptions.service.ts`

**Actions**
- Ensure every lifecycle/payment/usage/limit event writes a dedicated history record:
  - upgrade/downgrade/cancel/renew/expire
  - payment created/completed/failed
  - usage recorded + limit warning/exceeded
- Link history entries to:
  - subscriptionId, restaurantId
  - paymentId (when applicable)
  - usage key + delta + resulting value

---

### Step 3 — Implement Upgrade/Downgrade/Expire lifecycle APIs
**Files**
- `backend/src/modules/subscriptions/subscriptions.routes.ts`
- `backend/src/modules/subscriptions/subscriptions.controller.ts`
- `backend/src/modules/subscriptions/subscriptions.service.ts`

**Actions**
- Add routes:
  - `POST /:id/upgrade`
  - `POST /:id/downgrade`
  - `POST /:id/expire` (internal/admin; or allow via scheduler)
- Implement rules:
  - Validate eligibility (same cycle? seat changes? plan allow downgrade?)
  - Persist state transition + set period/cycle fields
  - Record history events
  - Write upgrade/downgrade recommendations notification (when downgrade/limit behavior requires it)

**State transition requirements**
- Allowed transitions based on current status.
- Upgrade/downgrade should update plan/planId and usage limits affecting enforcement.

---

### Step 4 — Add subscription expiry + auto-renew scheduler job
**Files**
- (new) `backend/src/jobs/subscriptionExpire.job.ts`
- `backend/src/jobs/index.ts`

**Actions**
- Scheduled scanning:
  - find subscriptions where `currentPeriodEnd <= now`
  - if `autoRenew=true`:
    - initiate renewal payment flow (create provider subscription/order and Payment records)
    - set `nextBillingDate`
  - else:
    - mark status `expired`
    - set `expiredAt`
    - send expiry notification

---

### Step 5 — Billing linkage + provider payment records + webhook transitions
**Files**
- `backend/src/modules/subscriptions/subscriptions.service.ts`
- `backend/src/modules/payments/payments.service.ts`
- `backend/src/modules/payments/payments.controller.ts` (if needed for raw body)
- `backend/src/modules/payments/payments.routes.ts` (maybe add new webhook paths)
- (optional new) `backend/src/modules/subscriptions/subscriptionBilling.service.ts`

**Actions**
- Create subscription-billing provider orders/subscriptions and store them in:
  - `SubscriptionPaymentModel` (providerOrderId/providerPaymentId/webhookEventId)
- Modify webhook handler to:
  - detect events related to subscription billing (not only table session payments)
  - on payment captured:
    - mark corresponding `SubscriptionPaymentModel` completed
    - transition `RestaurantSubscription` to active/new period
    - write payment completed history
  - on payment failed:
    - mark failed
    - set subscription status `past_due` or `suspended` per rules
    - write payment failed history

**Definition of Done**
- Renewal is driven by webhook updates, not only mock session payments.

---

### Step 6 — Runtime plan limit enforcement middleware/services
**Files**
- (new) `backend/src/modules/subscriptions/subscriptionEnforcement.service.ts`
- Add enforcement calls into:
  - `backend/src/modules/orders/orders.service.ts`
  - `backend/src/modules/reservations/reservations.service.ts`
  - `backend/src/modules/queue/queue.service.ts`
  - `backend/src/modules/tables/tables.service.ts`
  - `backend/src/modules/staff/staff.service.ts`
  - `backend/src/modules/inventory/inventory.service.ts`

**Actions**
- Implement helper:
  - `assertFeatureAllowed(restaurantId, featureKey, currentUsage?)`
  - reads `RestaurantSubscription.planId` → `PlatformPlanModel` flags/limits
- For each flow, decide when to block:
  - order placement if `ordersLimit` exceeded
  - reservation creation if `reservationAccess` disabled
  - queue join/seating if queue limit breached
  - staff create/role changes if `staffLimit` exceeded
  - inventory add/usage if `inventoryLimit` exceeded
- When blocked:
  - throw AppError with `ErrorCode.USAGE_LIMIT_EXCEEDED` (or introduce one)
  - write history `FEATURE_BLOCKED`
  - send limit exceeded notification

---

### Step 7 — System-wide usage monitoring + aggregation job
**Files**
- (new) `backend/src/jobs/subscriptionUsageAggregation.job.ts`
- Update `backend/src/jobs/index.ts`
- Update enforcement service to use aggregated counters

**Actions**
- Scheduled aggregation (e.g., hourly/daily):
  - orders totals per restaurant
  - active tables count
  - queue joins/seated sessions count
  - reservation activity count
  - discount usage count (if tracked)
  - traffic/analytics usage (if analytics module has signals)
- Persist to subscription usage counters.

---

### Step 8 — 80% threshold alerts + renewal reminders + upgrade recommendations
**Files**
- `backend/src/modules/subscriptions/subscriptions.service.ts`
- (new or extend) enforcement service and/or aggregation job

**Actions**
- Ensure 80% warning notifications fire consistently:
  - either during usage aggregation or during each usage increment
- Add additional notification types listed in TODO:
  - plan expiry notifications
  - limit exceeded notifications
  - upgrade recommendation notifications
  - renewal reminder notifications

---

### Step 9 — Technical improvements
**Files**
- `backend/src/modules/subscriptions/subscriptions.service.ts`
- Any place where subscription plan updates occur

**Actions**
- Wrap critical plan update + event/history writes in MongoDB transactions.
- Fix race condition during plan creation/updates:
  - use unique constraints + retry where appropriate.
- Replace string-based plan references with `ObjectId` end-to-end.

---

## Dependent/Touchpoint Summary
- Subscriptions module: routes/controller/service/model + new enforcement/billing jobs.
- Payments module: webhook handler updates for subscription billing events.
- Runtime flows: enforce limits in orders/reservations/queue/tables/staff/inventory services.
- Notifications: ensure all needed types are emitted via `NotificationsService.createNotification`.

---

## Testing / Validation (after implementation)
- Run backend TypeScript build.
- Validate via Postman collections:
  - subscription create/list/usage
  - upgrade/downgrade/expire flows
  - payment webhook renewal scenarios
- Confirm notifications are generated on:
  - 80% threshold crossing
  - limit exceeded
  - expiry/renewal reminders
