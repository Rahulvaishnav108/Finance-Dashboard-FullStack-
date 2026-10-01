// src/modules/tableSessions/tableSessions.model.ts
// Temporary dining session — replaces persistent customer auth
// Created via QR scan, no JWT/password/RBAC

import mongoose, { Schema, Document, Types } from 'mongoose';
import { SessionStatus } from '../../constants/statuses';

export interface ITableSession extends Document {
  restaurantId: Types.ObjectId;
  tableId: Types.ObjectId;
  customerName: string;
  mobile: string;
  sessionToken: string;
  sessionStart: Date;
  expiresAt: Date;

  // Activity tracking
  ipAddress?: string;
  userAgent?: string;
  lastActivityAt: Date;

  // Reservation and Queue linking
  reservationId?: Types.ObjectId;
  queueId?: Types.ObjectId;

  // Customer analytics
  customerProfileId?: Types.ObjectId;

  activeOrderId?: Types.ObjectId;
  isOrdering: boolean;
  lastOrderAttemptAt?: Date | null;
  status: SessionStatus;
  feedbackExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tableSessionSchema = new Schema<ITableSession>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
      index: true,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table ID is required'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      select: false, // Never returned in queries by default
    },
    sessionStart: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL — auto-delete expired docs
    },

    // Activity tracking
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    // Reservation and Queue linking
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
    queueId: {
      type: Schema.Types.ObjectId,
      ref: 'QueueEntry',
      default: null,
    },

    // Customer analytics identity
    customerProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'CustomerProfile',
      default: null,
      index: { sparse: true },
    },

    activeOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    isOrdering: {
      type: Boolean,
      default: false,
    },
    lastOrderAttemptAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.ACTIVE,
      index: true,
    },
    feedbackExpiresAt: {
    type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'tableSessions',
  }
);

// Compound index for fast session lookups
tableSessionSchema.index({ restaurantId: 1, tableId: 1, status: 1 });
tableSessionSchema.index({ lastActivityAt: 1 });

export const TableSessionModel = mongoose.model<ITableSession>('TableSession', tableSessionSchema);
