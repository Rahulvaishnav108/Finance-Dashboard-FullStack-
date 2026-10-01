# TODO Progress — Subscription & Plan Management

This file tracks implementation progress for `backend/TODO.md`.

## Completed
- [x] Confirmed `Subscription` endpoints exist (create/list/get/update/status/activate/cancel/renew + usage increment/report).
- [x] Verified `backend/TODO.md` remaining items are still not fully implemented (upgrade/downgrade/expire, plan enforcement, system-wide usage monitoring, 80% alerts, full billing linkage, technical improvements).

## In Progress (next work)
1. Schema/Foundation
   - [ ] Dedicated `RestaurantSubscription` source-of-truth entity alignment
   - [ ] Subscription history model linking lifecycle/payment/usage events
   - [ ] Enforce `planId` as `ObjectId` end-to-end
2. Lifecycle Engine
   - [x] Upgrade rules + state transition + history (initial phase)
   - [ ] Downgrade rules + state transition + history
   - [ ] Expire rules + scheduler/job + expiry notifications + history



## Blocked / Notes
- Current shell environment in this session rejects `&&` separators in `execute_command`; use separate commands instead.
