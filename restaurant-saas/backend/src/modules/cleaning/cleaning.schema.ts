import { Types } from 'mongoose';
import { z } from 'zod';
import { CleaningStatus, Priority } from '../../constants/statuses';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

const nullableObjectIdSchema = z.union([objectIdSchema, z.null()]);

export const cleaningTaskParamsSchema = z.object({
  id: objectIdSchema,
});

export const cleaningTaskQuerySchema = z.object({
  status: z.nativeEnum(CleaningStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
});

export const startCleaningBodySchema = z.object({
  staffId: nullableObjectIdSchema.optional(),
});

export const completeCleaningBodySchema = z.object({
  staffId: nullableObjectIdSchema.optional(),
});

export const verifyCleaningBodySchema = z.object({
  verifiedBy: nullableObjectIdSchema.optional(),
});
