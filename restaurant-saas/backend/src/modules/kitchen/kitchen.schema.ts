import { Types } from 'mongoose';
import { z } from 'zod';
import { BatchStatus, Priority } from '../../constants/statuses';
import { OrderStatus } from '../orders/orders.schema';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

const batchStatusSchema = z
  .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'COMPLETE'])
  .transform((value) => (value === 'COMPLETE' ? BatchStatus.COMPLETED : (value as BatchStatus)));

export const kitchenBatchParamsSchema = z.object({
  id: objectIdSchema,
});

export const kitchenOrdersQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  table: z.string().trim().min(1).optional(),
  batch: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const createKitchenBatchBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional().default('New Batch'),
  orderIds: z.array(objectIdSchema).min(1, 'At least one order is required'),
  station: z.string().trim().min(1).max(50).optional().default('Hot Line'),
});

export const updateKitchenBatchBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    status: batchStatusSchema.optional(),
    station: z.string().trim().min(1).max(50).optional(),
  })
  .refine((value) => value.name !== undefined || value.status !== undefined || value.station !== undefined, {
    message: 'At least one field must be provided',
  });
