import mongoose, { Document, Schema, Types } from 'mongoose';

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface ILoyaltyWallet extends Document {
  restaurantId: Types.ObjectId;

  mobile: string;
  customerName: string;

  pointsBalance: number;
  lifetimePoints: number;

  tier: LoyaltyTier;

  createdAt: Date;
  updatedAt: Date;
}

export interface ILoyaltyRule extends Document {
  restaurantId: Types.ObjectId;

  name: string;

  pointsPerAmount: number;
  minimumOrderAmount: number;

  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const loyaltyWalletSchema = new Schema<ILoyaltyWallet>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    pointsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    tier: {
      type: String,
      enum: Object.values(LoyaltyTier),
      default: LoyaltyTier.BRONZE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'loyaltyWallets',
  },
);

loyaltyWalletSchema.index(
  {
    restaurantId: 1,
    mobile: 1,
  },
  {
    unique: true,
  },
);

const loyaltyRuleSchema = new Schema<ILoyaltyRule>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    pointsPerAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'loyaltyRules',
  },
);

loyaltyRuleSchema.index({
  restaurantId: 1,
  active: 1,
});

export const LoyaltyWalletModel =
  mongoose.models.LoyaltyWallet ||
  mongoose.model<ILoyaltyWallet>('LoyaltyWallet', loyaltyWalletSchema);

export const LoyaltyRuleModel =
  mongoose.models.LoyaltyRule ||
  mongoose.model<ILoyaltyRule>('LoyaltyRule', loyaltyRuleSchema);
