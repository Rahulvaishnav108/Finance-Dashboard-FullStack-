// src/modules/auditLogs/auditLogs.types.ts
// Shared enums and types for the audit logging system.
// This file has zero external dependencies — safe to import anywhere.

// ── Entity types being tracked ────────────────────────────────────────
export enum AuditEntity {
  USER         = 'USER',
  ORDER        = 'ORDER',
  KITCHEN      = 'KITCHEN',
  PAYMENT      = 'PAYMENT',
  TABLE_SESSION = 'TABLE_SESSION',
  TABLE        = 'table',
  MENU_ITEM    = 'MENU_ITEM',
  QR           = 'QR',
  RESTAURANT   = 'RESTAURANT',
  STAFF        = 'STAFF',
  OFFER        = 'OFFER',
  BILL         = 'BILL',
  INVENTORY_ITEM = 'INVENTORY_ITEM',
  SUPPLIER     = 'SUPPLIER',
}

// ── Actions per entity ────────────────────────────────────────────────
export enum AuditAction {
  // Auth
  AUTH_REGISTER         = 'AUTH_REGISTER',
  AUTH_LOGIN            = 'AUTH_LOGIN',
  AUTH_LOGOUT           = 'AUTH_LOGOUT',
  AUTH_REFRESH          = 'AUTH_REFRESH',
  AUTH_FORGOT_PASSWORD  = 'AUTH_FORGOT_PASSWORD',
  AUTH_RESET_PASSWORD   = 'AUTH_RESET_PASSWORD',
  AUTH_SESSION_REVOKED  = 'AUTH_SESSION_REVOKED',
  ESCALATE_ISSUE        = 'ESCALATE_ISSUE',

  // Orders
  ORDER_PLACED          = 'ORDER_PLACED',
  ORDER_CANCELLED       = 'ORDER_CANCELLED',
  ORDER_REORDERED       = 'ORDER_REORDERED',
  ORDER_PICKED          = 'ORDER_PICKED',
  ORDER_SERVED          = 'ORDER_SERVED',
  ORDER_COMPLETED       = 'ORDER_COMPLETED',

  // Kitchen
  KITCHEN_ORDER_ACCEPTED = 'KITCHEN_ORDER_ACCEPTED',
  KITCHEN_ORDER_STARTED  = 'KITCHEN_ORDER_STARTED',
  KITCHEN_ORDER_READY    = 'KITCHEN_ORDER_READY',
  KITCHEN_ORDER_DELAYED  = 'KITCHEN_ORDER_DELAYED',
  KITCHEN_ORDER_REJECTED = 'KITCHEN_ORDER_REJECTED',

  // Payments
  PAYMENT_CREATED       = 'PAYMENT_CREATED',
  PAYMENT_VERIFIED      = 'PAYMENT_VERIFIED',
  PAYMENT_FAILED        = 'PAYMENT_FAILED',

  // Table sessions
  SESSION_CREATED       = 'SESSION_CREATED',
  SESSION_EXTENDED      = 'SESSION_EXTENDED',
  SESSION_ENDED         = 'SESSION_ENDED',
  SESSION_EXPIRED       = 'SESSION_EXPIRED',

  // Admin actions
  ADMIN_STAFF_CREATED   = 'ADMIN_STAFF_CREATED',
  ADMIN_STAFF_UPDATED   = 'ADMIN_STAFF_UPDATED',
  ADMIN_STAFF_DELETED   = 'ADMIN_STAFF_DELETED',
  ADMIN_MENU_ITEM_CREATED   = 'ADMIN_MENU_ITEM_CREATED',
  ADMIN_MENU_ITEM_UPDATED   = 'ADMIN_MENU_ITEM_UPDATED',
  ADMIN_MENU_ITEM_DELETED   = 'ADMIN_MENU_ITEM_DELETED',
  ADMIN_OFFER_CREATED   = 'ADMIN_OFFER_CREATED',
  ADMIN_OFFER_UPDATED   = 'ADMIN_OFFER_UPDATED',
  ADMIN_OFFER_DELETED   = 'ADMIN_OFFER_DELETED',
  ADMIN_SETTINGS_UPDATED = 'ADMIN_SETTINGS_UPDATED',
  ADMIN_INVENTORY_CREATED = 'ADMIN_INVENTORY_CREATED',
  ADMIN_INVENTORY_UPDATED = 'ADMIN_INVENTORY_UPDATED',
  ADMIN_INVENTORY_DELETED = 'ADMIN_INVENTORY_DELETED',
  ADMIN_INVENTORY_BULK_IMPORTED = 'ADMIN_INVENTORY_BULK_IMPORTED',
  ADMIN_SUPPLIER_CREATED = 'ADMIN_SUPPLIER_CREATED',
  ADMIN_SUPPLIER_UPDATED = 'ADMIN_SUPPLIER_UPDATED',
  ADMIN_SUPPLIER_DELETED = 'ADMIN_SUPPLIER_DELETED',

  // Super admin
  SUPER_RESTAURANT_APPROVED  = 'SUPER_RESTAURANT_APPROVED',
  SUPER_RESTAURANT_SUSPENDED = 'SUPER_RESTAURANT_SUSPENDED',
  SUPER_RESTAURANT_DELETED   = 'SUPER_RESTAURANT_DELETED',

  // QR Events
  QR_GENERATED               = 'QR_GENERATED',
  QR_REGENERATED             = 'QR_REGENERATED',
  QR_SCANNED                 = 'QR_SCANNED',
  INVALID_QR_ATTEMPT         = 'INVALID_QR_ATTEMPT',
}

// ── Payload passed to the log helper ─────────────────────────────────
export interface CreateAuditLogInput {
  actorId:      string;
  actorRole:    string;
  restaurantId?: string;
  entityType:   AuditEntity;
  entityId:     string;
  action:       AuditAction;
  metadata?:    Record<string, unknown>;
  ipAddress?:   string;
  userAgent?:   string;
}

// ── Query filters for admin list endpoint ─────────────────────────────
export interface AuditLogFilters {
  restaurantId?: string;
  actorId?:      string;
  actorRole?:    string;
  action?:       AuditAction;
  entityType?:   AuditEntity;
  from?:         string;   // ISO date string
  to?:           string;
  page?:         number;
  limit?:        number;
}
