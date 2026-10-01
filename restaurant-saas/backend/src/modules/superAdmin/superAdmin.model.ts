import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformPlan extends Document {
  name: string;
  priceMonthly: number;
  priceYearly?: number | null;
  description?: string | null;
  tenantLimit: number;
  usageLimit?: number;
  tableLimit?: number | null;
  dailyOrderLimit?: number | null;
  monthlyOrderLimit?: number | null;
  reservationAccess: boolean;
  queueAccess: boolean;
  advancedAnalytics: boolean;
  smartAutomation: boolean;
  dynamicDiscountEngine: boolean;
  staffLimit?: number | null;
  inventoryLimit?: number | null;
  reservationLimit?: number | null;
  queueLimit?: number | null;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const platformPlanSchema = new Schema<IPlatformPlan>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    priceMonthly: { type: Number, required: true, min: 0 },
    priceYearly: { type: Number, min: 0, default: null },
    description: { type: String, trim: true, default: null },
    tenantLimit: { type: Number, required: true, min: 1 },
    usageLimit: { type: Number, min: 0, default: null },
    tableLimit: { type: Number, min: 0, default: null },
    dailyOrderLimit: { type: Number, min: 0, default: null },
    monthlyOrderLimit: { type: Number, min: 0, default: null },
    reservationAccess: { type: Boolean, default: true },
    queueAccess: { type: Boolean, default: true },
    advancedAnalytics: { type: Boolean, default: false },
    smartAutomation: { type: Boolean, default: false },
    dynamicDiscountEngine: { type: Boolean, default: false },
    staffLimit: { type: Number, min: 0, default: null },
    inventoryLimit: { type: Number, min: 0, default: null },
    reservationLimit: { type: Number, min: 0, default: null },
    queueLimit: { type: Number, min: 0, default: null },
    features: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'plans',
  },
);

export interface IFeatureFlag extends Document {
  key: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: { type: String, required: true, trim: true, unique: true },
    enabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'featureFlags',
  },
);

export const PlatformPlanModel = mongoose.model<IPlatformPlan>('PlatformPlan', platformPlanSchema);
export const FeatureFlagModel = mongoose.model<IFeatureFlag>('FeatureFlag', featureFlagSchema);
