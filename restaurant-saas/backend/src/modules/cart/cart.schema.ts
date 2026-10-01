import { z } from 'zod';
import { Types } from 'mongoose';

// Reusable ObjectId validator
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const addItemBodySchema = z.object({
  menuItem: objectIdSchema,
  quantity: z.number().int().min(1).max(100).default(1),
  notes: z.string().max(200).optional(),
});

export const updateItemBodySchema = z.object({
  quantity: z.number().int().min(1).max(100).optional(),
  notes: z.string().max(200).optional(),
}).refine(data => data.quantity !== undefined || data.notes !== undefined, {
  message: 'At least one field (quantity or notes) must be provided for update',
});

export const itemIdParamsSchema = z.object({
  itemId: objectIdSchema,
});

export type AddItemInput = z.infer<typeof addItemBodySchema>;
export type UpdateItemInput = z.infer<typeof updateItemBodySchema>;
