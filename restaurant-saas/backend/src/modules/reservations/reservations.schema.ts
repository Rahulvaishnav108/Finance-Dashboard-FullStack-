import { Types } from 'mongoose';
import { z } from 'zod';
import { ReservationStatus } from '../../constants/statuses';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id format',
});

const nullableObjectIdSchema = z.union([objectIdSchema, z.null()]);

export const entityIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const reservationAvailabilityQuerySchema = z.object({
  restaurantId: objectIdSchema.optional(), // Can come from params or user
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  guests: z.coerce.number().int().min(1).max(20).optional(),
});

export const listReservationsQuerySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
  q: z.string().trim().optional(), // For searching by name or mobile
  notificationPreference: z.enum(['NONE', 'SMS', 'WHATSAPP']).optional(),
});

export const createReservationBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.string().trim().email().toLowerCase().optional(),
  mobile: z.string().trim().min(10).max(15),
  guests: z.number().int().min(1).max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  slot: z.string().regex(/^\d{1,2}:\d{2}$/, 'Slot must be in HH:mm format'),
  notes: z.string().trim().max(500).optional(),
  notificationPreference: z.enum(['NONE', 'SMS', 'WHATSAPP']).optional().default('NONE'),
});

export const updateReservationBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  customerName: z.string().trim().min(2).max(100).optional(),
  customerEmail: z.string().trim().email().toLowerCase().optional(),
  mobile: z.string().trim().min(10).max(15).optional(),
  guests: z.number().int().min(1).max(50).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  slot: z.string().regex(/^\d{1,2}:\d{2}$/, 'Slot must be in HH:mm format').optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
  tableId: nullableObjectIdSchema.optional(),
  notes: z.string().trim().max(500).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided to update',
});
export const checkInReservationBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  tableId: objectIdSchema.optional(),
});
