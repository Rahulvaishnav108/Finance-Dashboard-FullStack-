import { Types } from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

export const couponIdParamsSchema = z.object({
  couponId: z.string().trim().min(1).max(100),
});

export const applyCouponBodySchema = z.object({
  code: z.string().trim().min(1).max(50),
});

export const createPaymentBodySchema = z.object({
  orderId: objectIdSchema,
  amount: z.coerce.number().min(0).optional(),
  method: z.string().trim().min(1).max(50).optional(),
});

export const verifyPaymentBodySchema = z.object({
  paymentId: objectIdSchema,
});

export const paymentIdParamsSchema = z.object({
  paymentId: objectIdSchema,
});

export const feedbackBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional().default(''),
});
