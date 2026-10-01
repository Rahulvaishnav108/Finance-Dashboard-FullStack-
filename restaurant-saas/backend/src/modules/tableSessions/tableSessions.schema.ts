import { z } from 'zod';

export const validateTableSessionRequestSchema = z.object({
  body: z.object({
    token: z.string().trim().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const createTableSessionRequestSchema = z.object({
  body: z.object({
    token: z.string().trim().min(1),
    customerName: z.string().trim().min(2),
    mobile: z.string().trim().min(10).max(15).optional(),
    partySize: z.coerce.number().int().positive().max(20),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const startSessionSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  tableId: z.string().min(1, 'Table ID is required'),
  customerName: z.string().min(1, 'Customer name is required').max(100),
  mobile: z.string().min(10, 'Valid mobile number is required').max(15),
  reservationId: z.string().optional(),
});

export const recoverSessionSchema = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type RecoverSessionInput = z.infer<typeof recoverSessionSchema>;
