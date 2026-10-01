import mongoose, { Document, Schema, Types } from 'mongoose';
import { Priority, RequestStatus, RequestType } from '../../constants/statuses';

export interface IStaffRequest extends Document {
  restaurantId: Types.ObjectId;
  sessionId: Types.ObjectId;
  tableId: Types.ObjectId;
  type: RequestType;
  status: RequestStatus;
  priority: Priority;
  acceptedBy?: Types.ObjectId | null;
  completedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const staffRequestSchema = new Schema<IStaffRequest>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'TableSession', required: true, index: true },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    type: {
      type: String,
      enum: Object.values(RequestType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.NORMAL,
    },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    completedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'staffRequests',
  },
);

export const StaffRequestModel = mongoose.model<IStaffRequest>('StaffRequest', staffRequestSchema);
