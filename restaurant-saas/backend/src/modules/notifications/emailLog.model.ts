import mongoose, { Document, Schema } from 'mongoose';

export enum EmailType {
  OTP = 'OTP',
  PASSWORD_RESET = 'PASSWORD_RESET',
  STAFF_INVITATION = 'STAFF_INVITATION',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
  DAILY_SALES_REPORT = 'DAILY_SALES_REPORT',
  RECEIPT = 'RECEIPT',
  RESERVATION_CONFIRMATION = 'RESERVATION_CONFIRMATION',
  PASSWORD_CHANGED_ALERT = 'PASSWORD_CHANGED_ALERT',
  OTHER = 'OTHER'
}

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export interface IEmailLog extends Document {
  emailType: EmailType;
  recipient: string;
  status: EmailStatus;
  provider?: string;
  messageId?: string;
  sentAt: Date;
  failureReason?: string;
  restaurantId?: string; // Optional since some emails (like signup OTPs) aren't linked to a restaurant yet
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    emailType: { type: String, enum: Object.values(EmailType), required: true },
    recipient: { type: String, required: true },
    status: { type: String, enum: Object.values(EmailStatus), default: EmailStatus.PENDING },
    provider: { type: String },
    messageId: { type: String },
    sentAt: { type: Date, default: Date.now },
    failureReason: { type: String },
    restaurantId: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'email_logs',
  }
);

emailLogSchema.index({ restaurantId: 1, emailType: 1 });
emailLogSchema.index({ recipient: 1 });
emailLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 }); // 180 days TTL

export const EmailLogModel = mongoose.model<IEmailLog>('EmailLog', emailLogSchema);