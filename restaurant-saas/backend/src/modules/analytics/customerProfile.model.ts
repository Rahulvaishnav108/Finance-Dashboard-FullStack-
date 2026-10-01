// src/modules/analytics/customerProfile.model.ts
// Lightweight customer analytics profile — NO auth, NO JWT, NO RBAC
// Created automatically during QR session start for repeat-visit tracking

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomerProfile extends Document {
  mobile: string;
  name: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitAt: Date;
  firstVisitAt: Date;
  restaurantsVisited: Types.ObjectId[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const customerProfileSchema = new Schema<ICustomerProfile>(
  {
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    totalVisits: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastVisitAt: {
      type: Date,
      default: Date.now,
    },
    firstVisitAt: {
      type: Date,
      default: Date.now,
    },
    restaurantsVisited: [{
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
    }],
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const CustomerProfileModel = mongoose.model<ICustomerProfile>('CustomerProfile', customerProfileSchema);
