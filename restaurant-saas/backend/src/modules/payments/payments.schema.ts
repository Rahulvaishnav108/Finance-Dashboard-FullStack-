import mongoose from 'mongoose';
import { z } from 'zod';
import { PaymentStatus } from '../../constants/statuses';
import { PaymentMethod } from '../billing/billing.schema';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

export const paymentIdParamsSchema = z.object({
  paymentId: z.string().min(1, 'Payment id is required'),
});

export const createPaymentBodySchema = z
  .object({
    method: z.nativeEnum(PaymentMethod).optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  })
  .refine((value) => value.method || value.paymentMethod, {
    message: 'Payment method is required',
    path: ['method'],
  });

export const verifyPaymentBodySchema = z.object({
  // Internal bill/payment reference (used in mock & as fallback)
  paymentId: z.string().min(1, 'Payment id is required'),

  // Razorpay fields — all three required together when using Razorpay
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),

  // Dev/test only — simulate payment outcomes without real Razorpay
  simulateStatus: z.enum(['PENDING', 'PAID', 'COMPLETED', 'FAILED', 'EXPIRED']).optional(),
}).refine(
  (data) => {
    // If any Razorpay field is provided, all three must be present
    const razorpayFields = [data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature];
    const provided = razorpayFields.filter(Boolean).length;
    return provided === 0 || provided === 3;
  },
  {
    message: 'All three Razorpay fields (razorpay_order_id, razorpay_payment_id, razorpay_signature) must be provided together',
    path: ['razorpay_order_id'],
  },
);

export const razorpayWebhookBodySchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        amount: z.number(),
        currency: z.string(),
        status: z.string(),
        receipt: z.string().optional(),
        error_code: z.string().nullable().optional(),
        error_description: z.string().nullable().optional(),
      }),
    }).optional(),
  }),
});

export const listPaymentsQuerySchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  sessionId: objectIdSchema.optional(),
  orderId: objectIdSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreatePaymentInput = z.infer<typeof createPaymentBodySchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentBodySchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export type RazorpayWebhookBody = z.infer<typeof razorpayWebhookBodySchema>;
