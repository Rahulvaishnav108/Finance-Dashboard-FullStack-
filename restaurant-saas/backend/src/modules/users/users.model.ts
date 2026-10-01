// src/modules/users/users.model.ts
// Mongoose schema and model for User collection

import mongoose, { Document, Schema } from 'mongoose';
import { UserRole, KitchenRole, StaffInternalRole, CleaningRole } from '../../constants/roles';
import { UserStatus } from '../../constants/statuses';

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  password: string;

  role: UserRole;
  status: UserStatus;

  // Internal sub-roles within operational panels
  kitchen_role?: KitchenRole;
  staff_role?: StaffInternalRole;
  cleaning_role?: CleaningRole;

  restaurantId?: mongoose.Types.ObjectId;

  isEmailVerified: boolean;
  isMobileVerified: boolean;

  // Refresh token (bcrypt-hashed)
  refreshTokens: Array<{
    tokenHash: string;
    userAgent?: string;
    ip?: string;
    expiresAt: Date;
    createdAt: Date;
  }>;

  // Account lockout
  failedLoginAttempts: number;
  lockUntil?: Date;

  // Password reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Soft delete
  isDeleted: boolean;
  deletedAt?: Date;

  mustChangePassword?: boolean;

  avatar?: string | null;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema({
  tokenHash: { type: String, required: true },
  userAgent: { type: String },
  ip: { type: String },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false, // Never included in queries by default
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'User role is required'],
    },

    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },

    // Internal sub-roles within operational panels
    kitchen_role: {
      type: String,
      enum: [...Object.values(KitchenRole), null],
      default: null,
    },

    staff_role: {
      type: String,
      enum: [...Object.values(StaffInternalRole), null],
      default: null,
    },

    cleaning_role: {
      type: String,
      enum: [...Object.values(CleaningRole), null],
      default: null,
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false, // Never included in queries by default
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'users',
  }
);

// ── Indexes ───────────────────────────────────────────────────────────
// email and mobile indexes are auto-created by unique: true on schema fields
userSchema.index({ role: 1 });
userSchema.index({ restaurantId: 1 });
userSchema.index({ isDeleted: 1 });
// TTL index for auto-clearing locked accounts (lock expires naturally)
userSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0, sparse: true });

// ── Query middleware: exclude soft-deleted by default ──────────────────
userSchema.pre('find', function () {
  if (!Object.prototype.hasOwnProperty.call(this.getQuery(), 'isDeleted')) {
    this.where({ isDeleted: false });
  }
});

userSchema.pre('findOne', function () {
  if (!Object.prototype.hasOwnProperty.call(this.getQuery(), 'isDeleted')) {
    this.where({ isDeleted: false });
  }
});

userSchema.pre('countDocuments', function () {
  if (!Object.prototype.hasOwnProperty.call(this.getQuery(), 'isDeleted')) {
    this.where({ isDeleted: false });
  }
});

export const UserModel = mongoose.model<IUser>('User', userSchema);