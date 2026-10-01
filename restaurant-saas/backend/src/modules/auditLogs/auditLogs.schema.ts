// src/modules/auditLogs/auditLogs.schema.ts
// Mongoose schema for the auditLogs collection.
// APPEND-ONLY — no update or delete operations are ever performed on this collection.

import mongoose, { Document, Schema } from 'mongoose';
import { AuditAction, AuditEntity } from './auditLogs.types';

// ── Document interface ────────────────────────────────────────────────
export interface IAuditLog extends Document {
  actorId:      mongoose.Types.ObjectId;
  actorRole:    string;
  restaurantId?: mongoose.Types.ObjectId;
  entityType:   AuditEntity;
  entityId:     mongoose.Types.ObjectId | string;
  action:       AuditAction;
  metadata:     Record<string, unknown>;
  ipAddress?:   string;
  userAgent?:   string;
  createdAt:    Date;
}

// ── Schema ────────────────────────────────────────────────────────────
const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    actorRole: {
      type: String,
      required: true,
      trim: true,
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },

    entityType: {
      type: String,
      enum: Object.values(AuditEntity),
      required: true,
    },

    // entityId can be any ObjectId (order, payment, user, etc.)
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
    },

    // Free-form context: status transitions, amounts, rejection reasons, etc.
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },

    userAgent: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    // Only createdAt is needed — logs are never updated
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: 'auditLogs',
  },
);

// ── Indexes ───────────────────────────────────────────────────────────

// Primary read pattern: admin fetches logs for their restaurant sorted by date
auditLogSchema.index({ restaurantId: 1, createdAt: -1 });

// Filter by action type + date (e.g. all LOGIN events this week)
auditLogSchema.index({ action: 1, createdAt: -1 });

// Filter by role (e.g. all KITCHEN_STAFF actions)
auditLogSchema.index({ actorRole: 1, createdAt: -1 });

// Filter by entity (e.g. full history of a specific order)
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

// TTL index: auto-delete logs older than 90 days to keep Atlas storage lean.
// To change retention, update the expireAfterSeconds value and run:
//   db.auditLogs.dropIndex("createdAt_ttl")
//   db.auditLogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: <seconds> })
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90, name: 'createdAt_ttl' },
);

// ── Model ─────────────────────────────────────────────────────────────
export const AuditLogModel =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
