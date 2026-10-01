import mongoose, { Document, Schema } from "mongoose";

export enum BillStatus {
  DRAFT = "DRAFT",
  GENERATED = "GENERATED",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  UPI = "UPI",
  WALLET = "WALLET",
  ONLINE = "ONLINE",
}

export interface IAppliedCoupon {
  couponId: mongoose.Types.ObjectId;
  code: string;
  discountAmount: number;
}

export interface IBill extends Document {
  restaurantId: mongoose.Types.ObjectId;

  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  orderIds: mongoose.Types.ObjectId[];

  tableId?: mongoose.Types.ObjectId;

  sessionId?: mongoose.Types.ObjectId;

  subtotal: number;

  taxAmount: number;

  serviceCharge: number;

  discountAmount: number;

  finalAmount: number;

  appliedCoupons: IAppliedCoupon[];

  paymentMethod?: PaymentMethod;

  paymentId?: string;

  paymentStatus?: PaymentStatus;

  status: BillStatus;

  invoiceNumber?: string;

  wantsReceipt?: boolean;
  receiptDownloadedAt?: Date;
  receiptEmailedAt?: Date;
  receiptViewedAt?: Date;
  receiptSharedAt?: Date;

  requestedAt?: Date;

  paidAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const appliedCouponSchema = new Schema<IAppliedCoupon>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

export const billingSchema = new Schema<IBill>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    customerName: {
      type: String,
      trim: true,
      default: null,
    },

    customerEmail: {
      type: String,
      trim: true,
      default: null,
    },

    customerPhone: {
      type: String,
      trim: true,
      default: null,
    },

    orderIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    ],

    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },

    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "TableSession",
      default: null,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    appliedCoupons: {
      type: [appliedCouponSchema],
      default: [],
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: null,
    },

    paymentId: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(BillStatus),
      default: BillStatus.DRAFT,
    },

    invoiceNumber: {
      type: String,
      trim: true,
      default: null,
    },

    wantsReceipt: {
      type: Boolean,
      default: false,
    },

    receiptDownloadedAt: {
      type: Date,
      default: null,
    },

    receiptEmailedAt: {
      type: Date,
      default: null,
    },

    receiptViewedAt: {
      type: Date,
      default: null,
    },

    receiptSharedAt: {
      type: Date,
      default: null,
    },

    requestedAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

billingSchema.index({ restaurantId: 1 });
billingSchema.index({ customerId: 1 });
billingSchema.index({ tableId: 1 });
billingSchema.index({ sessionId: 1 });
billingSchema.index({ status: 1 });

export default billingSchema;