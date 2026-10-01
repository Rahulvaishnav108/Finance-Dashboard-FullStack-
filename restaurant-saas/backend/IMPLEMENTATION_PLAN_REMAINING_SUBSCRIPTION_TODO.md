# IMPLEMENTATION PLAN — Remaining Subscription TODOs

This plan completes the remaining items from `backend/TODO.md` that are not yet implemented.

## Current state (already implemented)
- Subscription billing webhook linkage (partial TODO #6):
  - `PaymentsService.handleRazorpayWebhook` now branches on `payment.entity.notes.subscriptionId`
  - updates `SubscriptionPaymentModel`, updates `SubscriptionModel`, writes `SubscriptionEventModel` history

- Subscription upgrade/downgrade/expire endpoints exist:
  - router + controller already wired for `/:id/upgrade`, `/:id/downgrade`, `/:id/expire`

## Terminology
- “History” uses the existing `subscriptionEvents` collection (`SubscriptionEventModel`) as handbook history.

## What must be completed
From `backend/TODO.md`:
1) Upgrade Subscription state transition + history completeness
2) Downgrade Subscription state transition + history completeness
3) Expire Subscription scheduler/job + expiry notifications
4) Subscription History (dedicated model + linkage) — use SubscriptionEventModel
5) Plan limits & feature flags runtime enforcement
6) Usage monitoring (system-wide aggregation) + tie into enforcement/notifications
7) Auto Limit Enforcement (80% alerts + consistent behavior)
8) Notifications: 80% alerts, plan expiry notifications, limit exceeded, upgrade recommendation, renewal reminders
9) Billing integration creation flow (provider subscription/payment order creation) — webhook linkage is ready, but creation workflow is missing
10) Technical improvements: transactions, race condition fix, ObjectId relationships

## Delivery order (dependency-aware)
### Phase A — Subscription lifecycle correctness
A1. Upgrade: implement eligibility + correct state transitions
- Add validation: only allow upgrades if current status allows it.
- Apply immediate transition:
  - set `SubscriptionModel.plan`, `seats`, `status`
  - ensure `RestaurantModel.plan` sync
- Write history:
  - `SubscriptionEventType.UPGRADED` with metadata:
    - fromPlan, toPlan, seats, billingCycle, appliesAt (now), autoRenew

A2. Downgrade: implement period-end transition
- On downgrade request:
  - set `metadata.pendingDowngrade = { plan, seats, requestedAt, appliesAt: currentPeriodEnd }`
  - do NOT change active `plan` immediately
- Write history:
  - `SubscriptionEventType.DOWNGRADED` with appliesAtPeriodEnd=true and metadata pending plan
- At period-end job (Phase B): apply pending downgrade, write history again as `DOWNGRADED_APPLIED` or reuse `DOWNGRADED` with metadata appliedAt.

A3. Expire: implement scheduler-driven expiry
- Ensure manual expire sets cancellationRequestedAt/expiredAt correctly based on `immediate`.

### Phase B — Expiry scheduler/job + renewal reminders
B1. Add job: `subscriptionsLifecycle.job.ts`
- Runs every minute.
- Finds subscriptions where:
  - `currentPeriodEnd <= now` AND status is active-like
- For each subscription:
  - If `autoRenew=true`:
    - if provider-managed renewal, only update `nextBillingDate`
    - else (if app-managed): set next period dates and write `AUTO_RENEWAL_SKIPPED` if payment missing
  - If `autoRenew=false`:
    - set status `EXPIRED`, set `expiredAt`
    - sync `RestaurantModel.plan` removal/disable (depending on your product model)
  - Apply pending downgrade if present
- Notifications:
  - plan expiry notifications
  - renewal reminders N days before nextBillingDate (configurable env/constant)

### Phase C — Runtime plan-limit enforcement + feature flags
C1. Create central enforcement helper:
- `subscriptionEnforcement.service.ts`
- Inputs: `{ restaurantId, action, quantity?, context }`
- Output: either allow or throw AppError (ErrorCode.TENANT_VIOLATION / USAGE_LIMIT_EXCEEDED)
- Enforcement uses:
  - `PlatformPlanModel` fields: `reservationAccess`, `queueAccess`, `tableLimit`, `dailyOrderLimit`, `monthlyOrderLimit`, `staffLimit`, `inventoryLimit`, `usageLimit`

C2. Add middleware/services at mutation points:
- Orders placement:
  - enforce dailyOrderLimit/monthlyOrderLimit
- Table creation/activation:
  - enforce tableLimit
- Reservations and queue operations:
  - enforce reservationAccess/queueAccess
- Staff/inventory:
  - enforce staffLimit/inventoryLimit

C3. Block premium features when limits breached
- Use the enforcement helper consistently and return/throw with a clear message.

### Phase D — System-wide usage monitoring and 80% alerts
D1. Add job: `subscriptionUsageAggregation.job.ts`
- Runs every X minutes.
- Aggregates per restaurant:
  - orders totals (daily/monthly)
  - active tables count
  - queue usage
  - reservations activity
  - staff/inventory counts
- Writes to `SubscriptionModel.usage` keys aligned to enforcement
- Triggers 80% warnings:
  - Create notifications when crossing threshold
  - Write `SubscriptionEventType.LIMIT_WARNING`

D2. Tie usage signals to enforcement
- Enforcement reads aggregated usage counters.

### Phase E — Upgrade recommendation notifications + limit exceeded notifications
E1. When enforcement denies an action:
- Send `LIMIT_EXCEEDED` notification
- Write history event `LIMIT_EXCEEDED`.

E2. When 80% threshold reached:
- Send upgrade recommendation (`UPGRADE_RECOMMENDATION`) notification.

### Phase F — Billing creation flow for subscriptions
F1. Add subscription purchase/upgrade workflow endpoints
- In `subscriptions.controller.ts` add endpoints (admin internal / superadmin internal):
  - `POST /:id/billing/create` (or similar)
  - creates provider subscription/order with Razorpay using `notes.subscriptionId/restaurantId/plan`
- Implement provider client call in `services/razorpay.service.ts`:
  - create Razorpay subscription or payment order for renewal

F2. Webhook linkage already exists (Phase already implemented)
- Ensure created provider orders include `notes.subscriptionId` and `notes.restaurantId` so the webhook can update correctly.

### Phase G — Technical improvements
G1. Add MongoDB transactions:
- Upgrade/downgrade/expire/apply pending downgrade + history writes

G2. Fix race condition during subscription create:
- Retry on duplicate key (unique restaurantId)

G3. ObjectId end-to-end plan reference
- Ensure `SubscriptionModel.planId` is populated from `PlatformPlanModel`
- Keep `SubscriptionModel.plan` string only for display.

## Testing & verification
- Run TypeScript typecheck/build
- Use Postman collections under `backend/postman/` for:
  - subscription lifecycle calls
  - webhook simulation for captured/failed
  - ensure notification records created

## Files to be edited/added (high-level)
- Add:
  - `backend/src/jobs/subscriptionsLifecycle.job.ts`
  - `backend/src/jobs/subscriptionUsageAggregation.job.ts`
  - `backend/src/services/subscriptionEnforcement.service.ts`
- Edit:
  - `backend/src/modules/subscriptions/subscriptions.service.ts`
  - `backend/src/modules/subscriptions/subscriptions.controller.ts`
  - `backend/src/modules/subscriptions/subscriptions.routes.ts`
  - `backend/src/modules/payments/payments.service.ts`
  - `backend/src/services/razorpay.service.ts`
  - `backend/src/modules/orders/*`, `tables/*`, `reservations/*`, `queue/*`, `staff/*`, `inventory/*`
  - `backend/TODO_PROGRESS.md`
  - Add/Update progress trackers for each phase
