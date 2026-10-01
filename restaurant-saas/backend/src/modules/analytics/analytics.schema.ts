import mongoose from 'mongoose';
import { z } from 'zod';

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const isoDateTimeSchema = z.string().datetime({ message: 'Datetime must be a valid ISO 8601 string' });
const analyticsDateSchema = z.union([dateOnlySchema, isoDateTimeSchema]);

function normalizeRangeDate(value: string, edge: 'start' | 'end'): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const suffix = edge === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
    return new Date(`${value}${suffix}`);
  }

  return new Date(value);
}

export const analyticsQuerySchema = z
  .object({
    from: analyticsDateSchema.optional(),
    to: analyticsDateSchema.optional(),
    groupBy: z.enum(['day', 'month']).optional(),
    restaurantId: z
      .string()
      .trim()
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'Invalid restaurant id',
      })
      .optional(),
  })
  .superRefine((value, context) => {
    if (!value.from || !value.to) {
      return;
    }

    if (normalizeRangeDate(value.from, 'start') > normalizeRangeDate(value.to, 'end')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'From date must be before or equal to to date',
        path: ['from'],
      });
    }
  });

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
