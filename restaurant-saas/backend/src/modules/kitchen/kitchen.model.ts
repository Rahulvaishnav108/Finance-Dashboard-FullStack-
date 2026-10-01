import mongoose, { Document, Schema, Types } from 'mongoose';
import { BatchStatus } from '../../constants/statuses';

export interface IKitchenBatch extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  orderIds: Types.ObjectId[];
  status: BatchStatus;
  station: string;
  createdAt: Date;
  updatedAt: Date;
}

const kitchenBatchSchema = new Schema<IKitchenBatch>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    orderIds: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    status: {
      type: String,
      enum: Object.values(BatchStatus),
      default: BatchStatus.PENDING,
    },
    station: { type: String, default: 'Hot Line', trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'kitchenBatches',
  },
);

export const KitchenBatchModel = mongoose.model<IKitchenBatch>('KitchenBatch', kitchenBatchSchema);
