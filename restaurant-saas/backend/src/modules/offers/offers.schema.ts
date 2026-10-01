import { Types } from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

export const offerIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const offersQuerySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  q: z.string().trim().min(1).optional(),
});

export const createOfferBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(50).transform((value) => value.toUpperCase()),
  discountPercent: z.coerce.number().min(0).max(100),
  active: z.boolean().optional(),
});

export const updateOfferBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    code: z.string().trim().min(2).max(50).transform((value) => value.toUpperCase()).optional(),
    discountPercent: z.coerce.number().min(0).max(100).optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });
