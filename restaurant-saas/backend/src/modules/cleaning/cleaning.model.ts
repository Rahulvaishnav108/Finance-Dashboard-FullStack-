import mongoose, { Document, Schema, Types } from 'mongoose';
import { CleaningStatus, Priority } from '../../constants/statuses';

export interface ICleaningTask extends Document {
  restaurantId: Types.ObjectId;
  tableId: Types.ObjectId;
  priority: Priority;
  status: CleaningStatus;
  startedBy?: Types.ObjectId | null;
  completedBy?: Types.ObjectId | null;
  verifiedBy?: Types.ObjectId | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const cleaningTaskSchema = new Schema<ICleaningTask>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.NORMAL,
    },
    status: {
      type: String,
      enum: Object.values(CleaningStatus),
      default: CleaningStatus.PENDING,
    },
    startedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    completedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'cleaningTasks',
  },
);

cleaningTaskSchema.index({ restaurantId: 1, status: 1 });

export const CleaningTaskModel = mongoose.model<ICleaningTask>('CleaningTask', cleaningTaskSchema);
