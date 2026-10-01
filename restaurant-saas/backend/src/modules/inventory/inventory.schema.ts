import { Types } from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

export const inventoryItemParamsSchema = z.object({
  id: objectIdSchema,
});

export const inventoryQuerySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  q: z.string().trim().min(1).optional(),
});

export const createInventoryItemBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  name: z.string().trim().min(2).max(120),
  stock: z.coerce.number().min(0),
  unit: z.string().trim().min(1).max(30),
  threshold: z.coerce.number().min(0),
  active: z.boolean().optional(),
  category: z.string().trim().min(1).max(50).optional(),
  pricePerUnit: z.coerce.number().min(0).optional(),
  supplierId: objectIdSchema.optional(),
  imageEmoji: z.string().trim().max(10).optional(),
  description: z.string().trim().max(500).optional(),
});

export const updateInventoryItemBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    stock: z.coerce.number().min(0).optional(),
    unit: z.string().trim().min(1).max(30).optional(),
    threshold: z.coerce.number().min(0).optional(),
    active: z.boolean().optional(),
    category: z.string().trim().min(1).max(50).optional(),
    pricePerUnit: z.coerce.number().min(0).optional(),
    supplierId: objectIdSchema.optional(),
    imageEmoji: z.string().trim().max(10).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const bulkImportInventoryBodySchema = z.array(createInventoryItemBodySchema).min(1).max(500);
