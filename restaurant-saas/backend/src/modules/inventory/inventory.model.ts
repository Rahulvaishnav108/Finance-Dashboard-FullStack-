import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInventoryItem extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  stock: number;
  unit: string;
  threshold: number;
  isLowStock: boolean;
  active: boolean;
  category?: string;
  pricePerUnit?: number;
  supplierId?: Types.ObjectId;
  imageEmoji?: string;
  description?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, trim: true },
    threshold: { type: Number, required: true, min: 0, default: 0 },
    isLowStock: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    category: { type: String, default: 'Uncategorized', trim: true },
    pricePerUnit: { type: Number, default: 0, min: 0 },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    imageEmoji: { type: String, trim: true },
    description: { type: String, trim: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'inventoryItems',
  },
);

inventoryItemSchema.index({ restaurantId: 1, active: 1 });
inventoryItemSchema.index({ restaurantId: 1, isLowStock: 1, active: 1 });
inventoryItemSchema.index(
  { restaurantId: 1, name: 1 },
  { unique: true, partialFilterExpression: { deletedAt: { $exists: false } } }
);

export const InventoryItemModel = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
