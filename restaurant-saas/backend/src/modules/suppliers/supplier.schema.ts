import { Types } from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

export const supplierParamsSchema = z.object({
  id: objectIdSchema,
});

export const supplierQuerySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  q: z.string().trim().min(1).optional(),
});

export const createSupplierBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  name: z.string().trim().min(2).max(120),
  contactPerson: z.string().trim().max(120).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  email: z.string().trim().email('Invalid email format').optional().or(z.literal('')),
  address: z.string().trim().max(500).optional(),
  active: z.boolean().optional(),
});

export const updateSupplierBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    contactPerson: z.string().trim().max(120).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    email: z.string().trim().email('Invalid email format').optional().or(z.literal('')),
    address: z.string().trim().max(500).optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });
