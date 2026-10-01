import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStaffShiftAssignment extends Document {
  restaurantId: Types.ObjectId;
  staffId: Types.ObjectId;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  notes?: string;
  active: boolean;
  assignedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const staffShiftAssignmentSchema = new Schema<IStaffShiftAssignment>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    days: [{ type: String, required: true, trim: true }],
    notes: { type: String, trim: true },
    active: { type: Boolean, default: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'staffShiftAssignments',
  },
);

staffShiftAssignmentSchema.index({ restaurantId: 1, staffId: 1, active: 1 });

export const StaffShiftAssignmentModel = mongoose.model<IStaffShiftAssignment>(
  'StaffShiftAssignment',
  staffShiftAssignmentSchema,
);
