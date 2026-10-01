import { Schema, model, Document, Types } from 'mongoose';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SubscriptionPaymentProvider {
  MANUAL = 'manual',
  MOCK = 'mock',
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
}

export enum SubscriptionPaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum SubscriptionEventType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  ACTIVATED = 'ACTIVATED',
  UPGRADED = 'UPGRADED',
  DOWNGRADED = 'DOWNGRADED',
  CANCELLED = 'CANCELLED',
  CANCELLATION_SCHEDULED = 'CANCELLATION_SCHEDULED',
  RENEWED = 'RENEWED',
  EXPIRED = 'EXPIRED',
  USAGE_RECORDED = 'USAGE_RECORDED',
  LIMIT_WARNING = 'LIMIT_WARNING',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  FEATURE_BLOCKED = 'FEATURE_BLOCKED',
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  AUTO_RENEWAL_SKIPPED = 'AUTO_RENEWAL_SKIPPED',
}

export interface ISubscriptionEvent extends Document {
  subscriptionId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  type: SubscriptionEventType;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface ISubscriptionPayment extends Document {
  subscriptionId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  planId: Types.ObjectId;
  provider: SubscriptionPaymentProvider;
  status: SubscriptionPaymentStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  providerSubscriptionId?: string | null;
  webhookEventId?: string | null;
  metadata: Record<string, unknown>;
  paidAt?: Date | null;
  failedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscription extends Document {
  restaurantId: Types.ObjectId;
  plan: string;
  planId: Types.ObjectId;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  seats: number;
  usage: Record<string, number>;
  activeTables: number;
  dailyOrderCount: number;
  monthlyOrderCount: number;
  usageCount: number;
  autoRenew: boolean;
  nextBillingDate?: Date | null;
  cancellationRequestedAt?: Date | null;
  cancelledAt?: Date | null;
  expiredAt?: Date | null;
  paymentProvider: SubscriptionPaymentProvider;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  lastPaymentId?: Types.ObjectId | null;
  lastPaymentReference?: string | null;
  isTrial?: boolean;
  trialStartsAt?: Date | null;
  trialEndsAt?: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    restaurantId: { type: Schema.Types.ObjectId, required: true, ref: 'Restaurant' },
    plan: { type: String, required: true, trim: true },
    planId: { type: Schema.Types.ObjectId, ref: 'PlatformPlan', required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: Object.values(BillingCycle),
      default: BillingCycle.MONTHLY,
    },
    startedAt: { type: Date, default: Date.now },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, required: true },
    seats: { type: Number, default: 1, min: 1 },
    usage: { type: Schema.Types.Mixed, default: {} },
    activeTables: { type: Number, default: 0, min: 0 },
    dailyOrderCount: { type: Number, default: 0, min: 0 },
    monthlyOrderCount: { type: Number, default: 0, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
    autoRenew: { type: Boolean, default: true },
    nextBillingDate: { type: Date, default: null },
    cancellationRequestedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    expiredAt: { type: Date, default: null },
    paymentProvider: {
      type: String,
      enum: Object.values(SubscriptionPaymentProvider),
      default: SubscriptionPaymentProvider.MOCK,
    },
    providerCustomerId: { type: String, trim: true, default: null },
    providerSubscriptionId: { type: String, trim: true, default: null },
    lastPaymentId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPayment', default: null },
    lastPaymentReference: { type: String, trim: true, default: null },
    isTrial: { type: Boolean, default: false },
    trialStartsAt: { type: Date, default: null },
    trialEndsAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: 'subscriptions', timestamps: true },
);

subscriptionSchema.index({ restaurantId: 1 }, { unique: true });
subscriptionSchema.index({ planId: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1, autoRenew: 1 });

const subscriptionEventSchema = new Schema<ISubscriptionEvent>(
  {
    subscriptionId: { type: Schema.Types.ObjectId, required: true, ref: 'Subscription', index: true },
    restaurantId: { type: Schema.Types.ObjectId, required: true, ref: 'Restaurant', index: true },
    type: { type: String, required: true, enum: Object.values(SubscriptionEventType), index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'subscriptionEvents', timestamps: false },
);

const subscriptionPaymentSchema = new Schema<ISubscriptionPayment>(
  {
    subscriptionId: { type: Schema.Types.ObjectId, required: true, ref: 'Subscription', index: true },
    restaurantId: { type: Schema.Types.ObjectId, required: true, ref: 'Restaurant', index: true },
    planId: { type: Schema.Types.ObjectId, required: true, ref: 'PlatformPlan' },
    provider: {
      type: String,
      enum: Object.values(SubscriptionPaymentProvider),
      default: SubscriptionPaymentProvider.MOCK,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionPaymentStatus),
      default: SubscriptionPaymentStatus.PENDING,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: Object.values(BillingCycle),
      default: BillingCycle.MONTHLY,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', trim: true, uppercase: true },
    providerOrderId: { type: String, trim: true, default: null, index: true },
    providerPaymentId: { type: String, trim: true, default: null, index: true },
    providerSubscriptionId: { type: String, trim: true, default: null },
    webhookEventId: { type: String, trim: true, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    paidAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
  },
  { collection: 'subscriptionPayments', timestamps: true },
);

subscriptionPaymentSchema.index({ provider: 1, providerOrderId: 1 });
subscriptionPaymentSchema.index({ restaurantId: 1, createdAt: -1 });

export const SubscriptionModel = model<ISubscription>('Subscription', subscriptionSchema);
export const SubscriptionEventModel = model<ISubscriptionEvent>('SubscriptionEvent', subscriptionEventSchema);
export const SubscriptionPaymentModel = model<ISubscriptionPayment>('SubscriptionPayment', subscriptionPaymentSchema);
