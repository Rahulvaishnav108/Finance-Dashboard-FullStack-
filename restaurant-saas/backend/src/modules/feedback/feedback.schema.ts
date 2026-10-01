import { z } from 'zod';

export const createFeedbackSchema = z.object({
  body: z.object({
    rating: z
      .number({
        required_error: 'Rating is required',
      })
      .min(1)
      .max(5),

    comment: z
      .string()
      .trim()
      .max(500)
      .optional()
      .default(''),
  }),
});

export type CreateFeedbackInput =
  z.infer<typeof createFeedbackSchema>['body'];