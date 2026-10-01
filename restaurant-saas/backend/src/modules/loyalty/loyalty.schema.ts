import mongoose from 'mongoose';
import { z } from 'zod';

export const createLoyaltyRuleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Rule name is required')
    .max(100, 'Rule name cannot exceed 100 characters'),

  pointsPerAmount: z
    .number()
    .int()
    .positive('Points per amount must be greater than 0'),

  minimumOrderAmount: z
    .number()
    .min(0, 'Minimum order amount cannot be negative')
    .default(0),
});

export type CreateLoyaltyRuleInput =
  z.infer<typeof createLoyaltyRuleSchema>;

export const walletQuerySchema = z.object({
  mobile: z
    .string()
    .trim()
    .min(10, 'Valid mobile number is required')
    .max(15),
});

export type WalletQueryInput =
  z.infer<typeof walletQuerySchema>;

export const redeemOfferParamsSchema = z.object({
  offerId: z.string().refine(
    (value) => mongoose.Types.ObjectId.isValid(value),
    {
      message: 'Invalid offer id',
    },
  ),
});

export type RedeemOfferParamsInput =
  z.infer<typeof redeemOfferParamsSchema>;
