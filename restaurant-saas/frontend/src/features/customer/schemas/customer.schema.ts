import { z } from 'zod';

export const cartItemSchema = z.object({
  id: z.number(),
  qty: z.number().int().positive(),
});

export const serviceRequestSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['waiter', 'water', 'cleaning', 'other']),
});

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  message: z.string().min(5, 'Please add a little more detail'),
});

export const paymentSchema = z.object({
  method: z.enum(['upi', 'card', 'cash']),
  amount: z.number().positive(),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
