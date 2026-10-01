// src/modules/tables/tables.schema.ts
// Zod validation schemas for table operations

import { z } from 'zod';
import { TableStatus } from '../../constants/statuses';

// ── Params schemas ───────────────────────────────────────────────────

export const tableIdParamsSchema = z.object({
  id: z.string().min(1, 'Table ID is required'),
});

export const restaurantTablesParamsSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
});

// ── Body schemas ─────────────────────────────────────────────────────

export const createTableSchema = z.object({
  restaurantId: z.string().min(1).optional(),
  tableNumber: z.string().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  number: z.coerce.number().int().positive().optional(),
  capacity: z.coerce.number().int().positive().max(50, 'Capacity cannot exceed 50'),
  floor: z.coerce.number().int().min(0).optional(),
  section: z.string().optional(),
  assignedStaffId: z.string().optional().nullable(),
  qrCode: z.string().optional(),
  qrToken: z.string().optional(),
});

export const updateTableSchema = z.object({
  tableNumber: z.string().min(1).optional(),
  capacity: z.coerce.number().int().positive().max(50).optional(),
  floor: z.coerce.number().int().min(0).optional(),
  section: z.string().optional(),
  assignedStaffId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateTableStatusSchema = z.object({
  status: z.nativeEnum(TableStatus),
});

// ── Request-level schemas (body + params combined) ───────────────────

export const createTableRequestSchema = {
  body: createTableSchema,
};

export const updateTableRequestSchema = {
  params: tableIdParamsSchema,
  body: updateTableSchema,
};

export const bulkCreateTablesRequestSchema = {
  body: z.object({
    tables: z.array(createTableSchema).min(1, 'At least one table is required'),
  }),
};

// ── Exported types ───────────────────────────────────────────────────

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type UpdateTableStatusInput = z.infer<typeof updateTableStatusSchema>;
