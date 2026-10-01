import mongoose, { Document, Schema, Types } from 'mongoose';
import { ReservationStatus } from '../../constants/statuses';

export enum NotificationPreference {
  NONE = 'NONE',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP'
}

export interface IReservation extends Document {
  restaurantId: Types.ObjectId;
  customerProfileId?: Types.ObjectId | null;
  customerName: string;
  customerEmail?: string;
  mobile: string;
  guests: number;
  date: string;
  slot: string;
  status: ReservationStatus;
  tableId?: Types.ObjectId | null;
  notes?: string;
  notificationPreference: NotificationPreference;
  notificationSentAt?: Date | null;
  lastNotificationType?: string | null;
  notificationFailureReason?: string | null;
  reminderSent: boolean;
  reminderSentAt?: Date | null;
  reminderFailureReason?: string | null;
  messageStatus?: string | null;
  messageProvider?: string | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    customerProfileId: { type: Schema.Types.ObjectId, ref: 'CustomerProfile', default: null, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    mobile: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1 },
    date: { type: String, required: true, trim: true },
    slot: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.PENDING,
    },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', default: null },
    notes: { type: String, trim: true },
    notificationPreference: {
      type: String,
      enum: Object.values(NotificationPreference),
      default: NotificationPreference.NONE
    },
    notificationSentAt: { type: Date, default: null },
    lastNotificationType: { type: String, default: null },
    notificationFailureReason: { type: String, default: null },
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: { type: Date, default: null },
    reminderFailureReason: { type: String, default: null },
    messageStatus: { type: String, default: null },
    messageProvider: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'reservations',
  },
);

reservationSchema.index({ restaurantId: 1, date: 1, slot: 1 });
reservationSchema.index({ restaurantId: 1, status: 1 });
reservationSchema.index({ restaurantId: 1, mobile: 1 });

export const ReservationModel = mongoose.model<IReservation>('Reservation', reservationSchema);