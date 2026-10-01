import mongoose, { Document, Schema, Types } from 'mongoose';

export enum TransactionAction {
  CREATE = 'CREATE',
  DEDUCT = 'DEDUCT',
  RESTORE = 'RESTORE',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  BULK_IMPORT = 'BULK_IMPORT',
}

export enum TransactionSource {
  SYSTEM = 'SYSTEM',
  KITCHEN = 'KITCHEN',
  ADMIN = 'ADMIN',
  BULK_IMPORT = 'BULK_IMPORT',
}

export interface IInventoryTransaction extends Document {
  restaurantId: Types.ObjectId;
  inventoryItemId: Types.ObjectId;
  action: TransactionAction;
  quantity: number;
  previousStock: number;
  newStock: number;
  performedBy?: Types.ObjectId;
  source: TransactionSource;
  referenceOrderId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true, index: true },
    action: { type: String, enum: Object.values(TransactionAction), required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    source: { type: String, enum: Object.values(TransactionSource), required: true },
    referenceOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'inventoryTransactions',
  }
);

inventoryTransactionSchema.index({ restaurantId: 1, inventoryItemId: 1, createdAt: -1 });

export const InventoryTransactionModel = mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);
