// src/modules/orders/orders.schema.ts

import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";
import { OrderStatus, Priority } from "../../constants/statuses";

export { OrderStatus };

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  notes?: string;
  ingredients?: {
    inventoryItemId: mongoose.Types.ObjectId;
    inventoryItemName: string;
    quantity: number;
  }[];
}

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;

  customerId?: mongoose.Types.ObjectId;

  tableId?: mongoose.Types.ObjectId;

  sessionId?: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;

  orderNumber: string;

  items: IOrderItem[];

  totalAmount: number;

  taxAmount: number;

  discountAmount: number;

  finalAmount: number;

  status: OrderStatus;
  priority: Priority;

  paymentStatus: PaymentStatus;

  specialInstructions?: string;

  estimatedPreparationTime?: number;
  kitchenStaffId?: mongoose.Types.ObjectId | null;
  serviceStaffId?: mongoose.Types.ObjectId | null;

  acceptedAt?: Date;
  preparingStartedAt?: Date;
  delayedAt?: Date;

  readyAt?: Date;
  rejectedAt?: Date;

  pickedAt?: Date;

  servedAt?: Date;

  completedAt?: Date;

  cancelledAt?: Date;

  rejectionReason?: string;

  stockDeducted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    ingredients: [
      {
        inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
        inventoryItemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        _id: false,
      },
    ],
  },
  {
    _id: false,
  }
);

export const orderSchema = new Schema<IOrder>(
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

    batchId: {
      type: Schema.Types.ObjectId,
      ref: "KitchenBatch",
      default: null,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    taxAmount: {
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

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },

    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.NORMAL,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },

    specialInstructions: {
      type: String,
      trim: true,
      default: "",
    },

    estimatedPreparationTime: {
      type: Number,
      default: null,
    },

    kitchenStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    serviceStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    preparingStartedAt: {
      type: Date,
      default: null,
    },

    delayedAt: {
      type: Date,
      default: null,
    },

    readyAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    pickedAt: {
      type: Date,
      default: null,
    },

    servedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    stockDeducted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'orders',
  }
);

// Indexes
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ tableId: 1 });
orderSchema.index({ sessionId: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ priority: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ kitchenStaffId: 1 });
orderSchema.index({ serviceStaffId: 1 });
orderSchema.index({ restaurantId: 1, stockDeducted: 1, createdAt: 1 });

export default orderSchema;

/*
|--------------------------------------------------------------------------
| ZOD VALIDATION SCHEMAS
|--------------------------------------------------------------------------
*/

export const placeOrderBodySchema = z.object({
  specialInstructions: z
    .string()
    .trim()
    .max(500, 'Special instructions cannot exceed 500 characters')
    .optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderBodySchema>;

export const acceptOrderBodySchema = z.object({
  estimatedPreparationTime: z
    .number()
    .int()
    .positive('Estimated time must be positive')
    .optional(),
});

export type AcceptOrderInput = z.infer<typeof acceptOrderBodySchema>;

export const rejectOrderBodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Rejection reason is required')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export type RejectOrderInput = z.infer<typeof rejectOrderBodySchema>;

export const delayOrderBodySchema = z.object({
  delayMinutes: z
    .number()
    .int()
    .positive('Delay minutes must be positive'),
});

export type DelayOrderInput = z.infer<typeof delayOrderBodySchema>;

export const orderIdParamsSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid order id',
  }),
});

export const customerOrdersQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
