import { z } from 'zod';

const billingCycleSchema = z.enum(['monthly', 'yearly']);
const paymentProviderSchema = z.enum(['manual', 'mock', 'razorpay', 'stripe']);

export const createSubscriptionSchema = z.object({
  restaurantId: z.string().min(1),
  plan: z.string().min(1),
  seats: z.number().int().positive().optional(),
  billingCycle: billingCycleSchema.optional(),
  autoRenew: z.boolean().optional(),
  paymentProvider: paymentProviderSchema.optional(),
  providerCustomerId: z.string().trim().optional().nullable(),
  providerSubscriptionId: z.string().trim().optional().nullable(),
  lastPaymentReference: z.string().trim().optional().nullable(),
  currentPeriodEnd: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }).optional(),
  isTrial: z.boolean().optional(),
  trialDays: z.number().int().positive().optional(),
});

export const updateSubscriptionSchema = z.object({
  plan: z.string().optional(),
  seats: z.number().int().positive().optional(),
  status: z.enum(['active', 'cancelled', 'past_due', 'suspended', 'expired']).optional(),
  billingCycle: billingCycleSchema.optional(),
  autoRenew: z.boolean().optional(),
  paymentProvider: paymentProviderSchema.optional(),
  providerCustomerId: z.string().trim().optional().nullable(),
  providerSubscriptionId: z.string().trim().optional().nullable(),
  lastPaymentReference: z.string().trim().optional().nullable(),
});

export const subscriptionIdParam = z.object({ id: z.string().min(1) });

export const lifecycleActionSchema = z.object({
  immediate: z.boolean().optional(),
});

export const renewSchema = z.object({
  days: z.coerce.number().int().positive().default(30),
});

export const billingOrderSchema = z.object({
  provider: paymentProviderSchema.default('mock'),
  currency: z.string().trim().min(3).max(3).default('INR'),
});

export const usageUpdateSchema = z.object({
  key: z.string().min(1),
  delta: z.coerce.number().int().positive().default(1),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type BillingOrderInput = z.infer<typeof billingOrderSchema>;
