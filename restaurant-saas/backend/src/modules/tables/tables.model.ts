// src/modules/tables/tables.model.ts
// Table entity — physical dining table with full lifecycle management

import mongoose, { Schema, Document, Types } from 'mongoose';
import { TableStatus } from '../../constants/statuses';

export interface ITable extends Document {
  restaurantId: Types.ObjectId;
  tableNumber: string;
  capacity: number;
  floor: number;
  section: string;
  assignedStaffId?: Types.ObjectId | null;
  status: TableStatus;
  qrCode?: string;
  qrToken: string;
  qrGeneratedAt: Date;
  qrLastRegeneratedAt: Date;
  isActive: boolean;
  currentSessionId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Valid state transitions for the table lifecycle */
export const TABLE_TRANSITIONS: Record<TableStatus, TableStatus[]> = {
  [TableStatus.AVAILABLE]: [TableStatus.RESERVED, TableStatus.OCCUPIED, TableStatus.MAINTENANCE],
  [TableStatus.RESERVED]: [TableStatus.AVAILABLE, TableStatus.OCCUPIED],
  [TableStatus.OCCUPIED]: [TableStatus.AVAILABLE, TableStatus.ORDERING, TableStatus.BILL_PENDING, TableStatus.PAYMENT_PENDING, TableStatus.DIRTY],
  [TableStatus.ORDERING]: [TableStatus.AVAILABLE, TableStatus.BILL_PENDING, TableStatus.PAYMENT_PENDING, TableStatus.DIRTY],
  [TableStatus.BILL_PENDING]: [TableStatus.PAID, TableStatus.DIRTY],
  [TableStatus.PAYMENT_PENDING]: [TableStatus.PAID, TableStatus.DIRTY],
  [TableStatus.PAID]: [TableStatus.DIRTY],
  [TableStatus.DIRTY]: [TableStatus.CLEANING, TableStatus.AVAILABLE, TableStatus.MAINTENANCE],
  [TableStatus.CLEANING]: [TableStatus.DIRTY, TableStatus.AVAILABLE, TableStatus.MAINTENANCE],
  [TableStatus.MAINTENANCE]: [],
};

const tableSchema = new Schema<ITable>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
      index: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Table capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [50, 'Capacity cannot exceed 50'],
    },
    floor: {
      type: Number,
      default: 1,
      min: 0,
    },
    section: {
      type: String,
      default: 'Main',
      trim: true,
    },
    assignedStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TableStatus),
      default: TableStatus.AVAILABLE,
    },
    qrCode: {
      type: String,
      required: false,
      trim: true,
    },
    qrToken: {
      type: String,
      required: [true, 'QR token is required'],
      unique: true,
      trim: true,
      index: true,
    },
    qrGeneratedAt: {
      type: Date,
      default: Date.now,
    },
    qrLastRegeneratedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'TableSession',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (['OCCUPIED', 'ORDERING', 'BILL_PENDING', 'PAYMENT_PENDING', 'PAID'].includes(ret.status)) {
          ret.status = TableStatus.OCCUPIED;
        }
        return ret;
      }
    },
    toObject: { virtuals: true },
    collection: 'tables',
  }
);

// Compound unique index: one table number per restaurant
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });
tableSchema.index({ status: 1 });
tableSchema.index({ restaurantId: 1, floor: 1, section: 1 });

/**
 * Check if a status transition is valid.
 */
tableSchema.methods.canTransitionTo = function (newStatus: TableStatus): boolean {
  const allowed = TABLE_TRANSITIONS[this.status as TableStatus];
  return allowed ? allowed.includes(newStatus) : false;
};

export const TableModel = mongoose.model<ITable>('Table', tableSchema);
