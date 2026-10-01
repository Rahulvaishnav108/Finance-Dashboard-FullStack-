import mongoose, { Document, Schema, Types } from 'mongoose';
import { Priority, QueueStatus } from '../../constants/statuses';

export interface IQueueEntry extends Document {
  restaurantId: Types.ObjectId;
  customerProfileId?: Types.ObjectId | null;
  customerName: string;
  mobile: string;
  guests: number;
  priority: Priority;
  status: QueueStatus;
  etaMinutes: number;
  tableId?: Types.ObjectId | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const queueEntrySchema = new Schema<IQueueEntry>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    customerProfileId: { type: Schema.Types.ObjectId, ref: 'CustomerProfile', default: null, index: true },
    customerName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1 },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.NORMAL,
    },
    status: {
      type: String,
      enum: Object.values(QueueStatus),
      default: QueueStatus.WAITING,
    },
    etaMinutes: { type: Number, default: 15, min: 0 },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', default: null },
    notes: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'queues',
  },
);

queueEntrySchema.index({ restaurantId: 1, status: 1 });
queueEntrySchema.index({ restaurantId: 1, mobile: 1 });
queueEntrySchema.index({ restaurantId: 1, createdAt: 1 });

export const QueueEntryModel = mongoose.model<IQueueEntry>('QueueEntry', queueEntrySchema);
