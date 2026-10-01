import { Schema, Document, Types, model } from 'mongoose';

export interface ISupplier extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    active: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique name per restaurant, excluding soft-deleted items
supplierSchema.index(
  { restaurantId: 1, name: 1 },
  { unique: true, partialFilterExpression: { deletedAt: { $exists: false } } }
);

export const SupplierModel = model<ISupplier>('Supplier', supplierSchema);
