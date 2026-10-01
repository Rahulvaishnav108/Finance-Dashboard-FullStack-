# Subscription & Plan Management — Completion Checklist

> Handbook module: Restaurant Subscription & Plan Management

## Scope areas

### 1) Restaurant Subscription Lifecycle
- [x] Subscription endpoints exist (create/list/get/update/status/activate/cancel/renew + usage increment/report)
- [ ] Upgrade Subscription (upgrade rules + state transition + history)
- [ ] Downgrade Subscription (downgrade rules + state transition + history)
- [ ] Expire Subscription (scheduler/job + expiry state + notifications)
- [ ] Subscription History (dedicated history model + link to each lifecycle/payment/usage event)
- [ ] Dedicated `RestaurantSubscription` entity as handbook source-of-truth (planId ObjectId, billing cycle, auto-renew, payment refs)

**Current status:** Partially complete (endpoints present), lifecycle engine pieces missing.

---

### 2) Plan Limits & Feature Flags
- [x] `PlatformPlanModel` contains many handbook flags/limits (reservationAccess, queueAccess, analytics/automation/discount flags, staffLimit, inventoryLimit, etc.)
- [x] Add remaining required limits if missing from plan schema (PlatformPlanModel already includes most handbook flags/limits)
- [ ] Enforce limits across system (tables, orders, reservations, queue, staff, inventory)
- [ ] Premium feature restriction logic when limits breached


**Current status:** Partial.

---

### 3) Usage Monitoring
- [x] Subscription-level usage counters exist (generic `incrementUsage` + `getUsageReport`)
- [ ] System-wide usage tracking/aggregation (orders totals, active tables, queue usage, reservations activity, discount usage, traffic, analytics usage)
- [ ] Tie usage signals to limit checks + notifications + admin dashboards

**Current status:** Missing system-wide monitoring.

---

### 4) Auto Limit Enforcement
- [ ] Middleware/services to detect breaches and restrict features
- [ ] Automatic 80% threshold alert triggering
- [ ] Consistent behavior across all relevant flows (table actions, order placement, reservation/queue access)

**Current status:** Missing.

---

### 5) Notifications
- [x] Notifications module exists (create notification + scoping + read flow)
- [ ] 80% usage alerts
- [ ] Plan expiry notifications
- [ ] Limit exceeded notifications
- [ ] Upgrade recommendation notifications
- [ ] Renewal reminder notifications

**Current status:** Missing/partially wired.

---

### 6) Billing Integration (Subscriptions)
- [x] Customer payment + billing flows exist (Bills/Payments models + Razorpay webhook handling)
- [ ] Subscription billing creation (Razorpay/Stripe) linked to `RestaurantSubscription`
- [ ] Subscription payment records (providerOrderId/paymentId/webhookEventId) linked to subscription lifecycle
- [ ] Auto-renewal handling (scheduler + webhook success/failure transitions)
- [ ] Upgrade/downgrade proration and payment adjustments (if required by handbook)

**Current status:** Missing subscription billing linkage/webhooks.

---

## 7) Technical improvements (supporting)
- [ ] Add MongoDB transactions for plan updates
- [ ] Fix race condition during plan creation
- [ ] Replace string-based plan references with proper database relationships (`ObjectId`) end-to-end

---

## Notes / Definition of Done
To mark the module as complete, the following must be true:
1) RestaurantSubscription is the single source of truth.
2) Upgrade/downgrade/renew/cancel/expire flows update state consistently and write history.
3) Plan limits are enforced at runtime everywhere required.
4) Usage monitoring drives notifications and enforcement.
5) Subscription billing lifecycle is fully linked + webhook-driven.
