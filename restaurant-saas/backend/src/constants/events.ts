// src/constants/events.ts
// Socket.io event name constants — matches Phase 6 Contract

export const SocketEvent = {
  // ── Session lifecycle events ──────────────────────────────────────────
  SESSION_STARTED: 'table.session.created',
  SESSION_EXPIRED: 'table.session.expired',
  SESSION_CLOSED: 'table.session.closed',

  // ── Table lifecycle events (granular) ─────────────────────────────────
  TABLE_OCCUPIED: 'table.status.changed',
  TABLE_AVAILABLE: 'table.status.changed',
  TABLE_NEEDS_CLEANING: 'table.status.changed',
  TABLE_CLEANING_STARTED: 'table.status.changed',
  TABLE_PAYMENT_PENDING: 'table.status.changed',

  // ── Table events (generic) ────────────────────────────────────────────
  TABLE_STATUS_UPDATED: 'table.status.changed',

  // ── Queue events ──────────────────────────────────────────────────────
  QUEUE_UPDATED: 'queue:updated',

  // ── Reservation events ────────────────────────────────────────────────
  RESERVATION_CREATED: 'reservation:created',

  // ── Order events ──────────────────────────────────────────────────────
  ORDER_NEW: 'order.created',
  ORDER_STATUS_UPDATED: 'order.updated',
  ORDER_READY: 'order.ready',

  // ── Kitchen events ────────────────────────────────────────────────────
  KITCHEN_BATCH_UPDATED: 'kitchen:batch-updated',

  // ── Staff events ──────────────────────────────────────────────────────
  STAFF_REQUEST_NEW: 'staff:request-new',

  // ── Billing events ────────────────────────────────────────────────────
  BILLING_UPDATED: 'bill.requested',

  // ── Payment events ────────────────────────────────────────────────────
  PAYMENT_CONFIRMED: 'bill.paid',

  // ── Cleaning events ───────────────────────────────────────────────────
  CLEANING_STARTED: 'cleaning.started',
  CLEANING_COMPLETED: 'cleaning.completed',
  CLEANING_TASK_NEW: 'cleaning.started',

  // ── Notification events ───────────────────────────────────────────────
  NOTIFICATION_NEW: 'notification:new',

  // ── Offer events ──────────────────────────────────────────────────────
  OFFER_UPDATED: 'offer:updated',

  // ── QR events ─────────────────────────────────────────────────────────
  QR_REGENERATED: 'qr.regenerated',
} as const;

export type SocketEventType = typeof SocketEvent[keyof typeof SocketEvent];
