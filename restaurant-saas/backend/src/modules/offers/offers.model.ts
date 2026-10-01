import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOffer extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  code: string;
  discountPercent: number;
  requiredPoints: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    requiredPoints: { type: Number, default: 0, min: 0,},
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'offers',
  },

);

offerSchema.index({ restaurantId: 1, active: 1 });
offerSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

export const OfferModel = mongoose.model<IOffer>('Offer', offerSchema);
