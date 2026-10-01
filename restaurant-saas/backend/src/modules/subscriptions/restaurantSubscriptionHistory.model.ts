import { Schema, model, Document, Types } from 'mongoose';

export enum RestaurantSubscriptionHistoryEventType {
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  PLAN_UPDATED = 'PLAN_UPDATED',
  UPGRADED = 'UPGRADED',
  DOWNGRADED = 'DOWNGRADED',
  CANCELLED = 'CANCELLED',
  CANCELLATION_SCHEDULED = 'CANCELLATION_SCHEDULED',
  RENEWED = 'RENEWED',
  EXPIRED = 'EXPIRED',
  USAGE_RECORDED = 'USAGE_RECORDED',
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  LIMIT_WARNING = 'LIMIT_WARNING',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  FEATURE_BLOCKED = 'FEATURE_BLOCKED',
}

export interface IRestaurantSubscriptionHistory extends Document {
  subscriptionId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  eventType: RestaurantSubscriptionHistoryEventType;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const restaurantSubscriptionHistorySchema = new Schema<IRestaurantSubscriptionHistory>(
  {
    subscriptionId: { type: Schema.Types.ObjectId, required: true, ref: 'Subscription', index: true },
    restaurantId: { type: Schema.Types.ObjectId, required: true, ref: 'Restaurant', index: true },
    eventType: { type: String, required: true, enum: Object.values(RestaurantSubscriptionHistoryEventType), index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: 'restaurantSubscriptionHistory', timestamps: true },
);



restaurantSubscriptionHistorySchema.index({ restaurantId: 1, subscriptionId: 1, createdAt: -1 });

export const RestaurantSubscriptionHistoryModel = model<IRestaurantSubscriptionHistory>(
  'RestaurantSubscriptionHistory',
  restaurantSubscriptionHistorySchema,
);
