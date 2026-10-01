// src/modules/auditLogs/auditLogs.validation.ts
// Zod schemas for validating incoming query params on admin audit log routes.
// No body validation needed — this module is read-only from the API side.

import { z } from 'zod';
import { AuditAction, AuditEntity } from './auditLogs.types';

// ── GET /admin/audit-logs ─────────────────────────────────────────────
export const auditLogListQuerySchema = z.object({
  // Filter by restaurant (super admin can query any; admin is restricted in the service)
  restaurantId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid restaurantId format')
    .optional(),

  // Filter by specific actor user
  actorId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid actorId format')
    .optional(),

  // Filter by actor role (e.g. KITCHEN_STAFF, SERVICE_STAFF)
  actorRole: z.string().trim().optional(),

  // Filter by specific action enum value
  action: z
    .nativeEnum(AuditAction, {
      errorMap: () => ({ message: 'Invalid action value' }),
    })
    .optional(),

  // Filter by entity type
  entityType: z
    .nativeEnum(AuditEntity, {
      errorMap: () => ({ message: 'Invalid entityType value' }),
    })
    .optional(),

  // Date range filters — ISO 8601 strings
  from: z
    .string()
    .datetime({ message: 'from must be a valid ISO 8601 datetime' })
    .optional(),

  to: z
    .string()
    .datetime({ message: 'to must be a valid ISO 8601 datetime' })
    .optional(),

  // Pagination
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1, 'page must be at least 1')),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100, 'limit cannot exceed 100')),
});

// ── GET /admin/audit-logs/:id ─────────────────────────────────────────
export const auditLogIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid audit log id format'),
});

export type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>;
export type AuditLogIdParam  = z.infer<typeof auditLogIdParamSchema>;