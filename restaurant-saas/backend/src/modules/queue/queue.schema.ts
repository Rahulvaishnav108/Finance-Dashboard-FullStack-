import { Types } from 'mongoose';
import { z } from 'zod';
import { Priority, QueueStatus } from '../../constants/statuses';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id format',
});

export const entityIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const publicQueueJoinBodySchema = z.object({
  restaurantId: objectIdSchema,
  customerName: z.string().trim().min(1).max(100).default('Walk-in Guest'),
  guests: z.coerce.number().int().min(1).max(20).default(2),
});

export const joinQueueBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  customerName: z.string().trim().min(2).max(100),
  mobile: z.string().trim().min(10).max(15),
  guests: z.number().int().min(1).max(50),
  priority: z.nativeEnum(Priority).optional(),
  notes: z.string().trim().max(500).optional(),
  etaMinutes: z.number().int().min(0).max(300).optional(),
});

export const updateQueuePriorityBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  priority: z.nativeEnum(Priority),
});

export const seatWalkInBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  tableId: objectIdSchema,
});

export const listQueueQuerySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  status: z.nativeEnum(QueueStatus).optional(),
});
