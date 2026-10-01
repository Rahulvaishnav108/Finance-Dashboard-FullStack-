# TODO Progress — Subscription billing linkage

## Completed
- (Planned) Extend `PaymentsService.handleRazorpayWebhook` to recognize subscription billing payments using Razorpay `notes.subscriptionId`.

## Implemented
- Updated webhook handler to branch:
  - If `notes.subscriptionId` exists: create/update `SubscriptionPaymentModel`, update `SubscriptionModel`, write `SubscriptionEventModel` (PAYMENT_COMPLETED/FAILED and RENEWED).
  - Else: keep existing customer bill payment behavior.

## Notes
- Uses note keys: `subscriptionId`, `restaurantId`.
- Billing cycle transition currently uses heuristic addDays: yearly=365, monthly=30.
- Webhook payload parsing uses `payment.entity.notes` when present.
