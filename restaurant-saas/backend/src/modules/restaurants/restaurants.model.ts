import mongoose, { Document, Schema } from 'mongoose';
import { RestaurantStatus } from '../../constants/statuses';

type RestaurantSettings = {
  currency: string;
  taxRate: number;
  serviceChargeEnabled: boolean;
  sessionDurationMinutes: number;
  emailPreferences: {
    dailySalesReports: boolean;
    inventoryAlerts: boolean;
    staffNotifications: boolean;
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    footerText?: string;
    website?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
  timezone: string;
  dateFormat: string;
  timeFormat: string;
};

export interface IRestaurant extends Document {
  slug: string;
  name: string;
  status: RestaurantStatus;
  plan: string;
  cuisine: string;
  city: string;
  rating: number;
  settings: RestaurantSettings;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSettingsSchema = new Schema<RestaurantSettings>(
  {
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 0.05, min: 0 },
    serviceChargeEnabled: { type: Boolean, default: true },
    sessionDurationMinutes: { type: Number, default: 90, min: 15 },
    emailPreferences: {
      type: {
        dailySalesReports: { type: Boolean, default: true },
        inventoryAlerts: { type: Boolean, default: true },
        staffNotifications: { type: Boolean, default: true },
      },
      default: () => ({
        dailySalesReports: true,
        inventoryAlerts: true,
        staffNotifications: true,
      }),
    },
    branding: {
      type: {
        logo: { type: String, trim: true },
        primaryColor: { type: String, trim: true },
        secondaryColor: { type: String, trim: true },
        footerText: { type: String, trim: true },
        website: { type: String, trim: true },
        supportEmail: { type: String, trim: true },
        supportPhone: { type: String, trim: true },
      },
      default: null,
    },
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'YYYY-MM-DD' },
    timeFormat: { type: String, default: 'HH:mm' },
  },
  { _id: false },
);

const restaurantSchema = new Schema<IRestaurant>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(RestaurantStatus),
      default: RestaurantStatus.ACTIVE,
    },
    plan: { type: String, required: true, trim: true },
    cuisine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    settings: {
      type: restaurantSettingsSchema,
      default: () => ({
        currency: 'INR',
        taxRate: 0.05,
        serviceChargeEnabled: true,
        sessionDurationMinutes: 90,
        emailPreferences: {
          dailySalesReports: true,
          inventoryAlerts: true,
          staffNotifications: true,
        },
        branding: undefined,
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      }),
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'restaurants',
  },
);

restaurantSchema.index({ status: 1 });
restaurantSchema.index({ plan: 1 });

export const RestaurantModel = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);