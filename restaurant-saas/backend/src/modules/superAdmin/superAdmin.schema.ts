// src/modules/superAdmin/superAdmin.schema.ts
// Zod validation schemas for all super admin endpoints.

import { z } from 'zod';

// ── Reusable ──────────────────────────────────────────────────────────
const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

// ── Restaurant management ─────────────────────────────────────────────

export const restaurantIdParamSchema = z.object({
  id: objectIdSchema,
});

export const restaurantListQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  plan:   z.string().trim().optional(),
  search: z.string().trim().optional(),
  page:   z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit:  z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

// ── Plans ─────────────────────────────────────────────────────────────

export const createPlanSchema = z.object({
  name:          z.string().trim().min(1, 'Plan name is required'),
  priceMonthly:  z.number().min(0, 'Price cannot be negative'),
  priceYearly:   z.number().min(0, 'Yearly price cannot be negative').optional().nullable(),
  description:   z.string().trim().max(1000).optional().nullable(),
  tenantLimit:   z.number().int().min(1, 'Tenant limit must be at least 1'),
  usageLimit:    z.number().int().min(0, 'Usage limit must be 0 or greater').optional(),
  tableLimit:    z.number().int().min(0, 'Table limit must be 0 or greater').optional(),
  dailyOrderLimit: z.number().int().min(0, 'Daily order limit must be 0 or greater').optional(),
  monthlyOrderLimit: z.number().int().min(0, 'Monthly order limit must be 0 or greater').optional(),
  reservationAccess: z.boolean().optional(),
  queueAccess: z.boolean().optional(),
  advancedAnalytics: z.boolean().optional(),
  smartAutomation: z.boolean().optional(),
  dynamicDiscountEngine: z.boolean().optional(),
  staffLimit:     z.number().int().min(0, 'Staff limit must be 0 or greater').optional(),
  inventoryLimit: z.number().int().min(0, 'Inventory limit must be 0 or greater').optional(),
  features:       z.array(z.string().trim().min(1)).optional(),
});

export const updatePlanSchema = z.object({
  name:          z.string().trim().min(1).optional(),
  priceMonthly:  z.number().min(0).optional(),
  priceYearly:   z.number().min(0).optional().nullable(),
  description:   z.string().trim().max(1000).optional().nullable(),
  tenantLimit:   z.number().int().min(1).optional(),
  usageLimit:    z.number().int().min(0).optional(),
  tableLimit:    z.number().int().min(0).optional(),
  dailyOrderLimit: z.number().int().min(0).optional(),
  monthlyOrderLimit: z.number().int().min(0).optional(),
  reservationAccess: z.boolean().optional(),
  queueAccess: z.boolean().optional(),
  advancedAnalytics: z.boolean().optional(),
  smartAutomation: z.boolean().optional(),
  dynamicDiscountEngine: z.boolean().optional(),
  staffLimit:     z.number().int().min(0).optional(),
  inventoryLimit: z.number().int().min(0).optional(),
  features:       z.array(z.string().trim().min(1)).optional(),
});

export const planIdParamSchema = z.object({
  id: objectIdSchema,
});

// ── Feature flags ─────────────────────────────────────────────────────

export const featureFlagIdParamSchema = z.object({
  id: objectIdSchema,
});

export const updateFeatureFlagSchema = z.object({
  enabled: z.boolean({ required_error: 'enabled is required' }),
});

// ── Analytics ─────────────────────────────────────────────────────────

export const analyticsQuerySchema = z.object({
  // groupBy controls the time bucketing
  groupBy: z.enum(['day', 'week', 'month', 'year']).optional().default('day'),
  from:    z
    .string()
    .datetime({ message: 'from must be a valid ISO 8601 datetime' })
    .optional(),
  to:      z
    .string()
    .datetime({ message: 'to must be a valid ISO 8601 datetime' })
    .optional(),
});

// ── Audit logs ────────────────────────────────────────────────────────

export const superAdminAuditLogQuerySchema = z.object({
  actorId:  objectIdSchema.optional(),
  action:   z.string().trim().optional(),
  from:     z
    .string()
    .datetime({ message: 'from must be a valid ISO 8601 datetime' })
    .optional(),
  to:       z
    .string()
    .datetime({ message: 'to must be a valid ISO 8601 datetime' })
    .optional(),
  page:     z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit:    z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

// ── Exported types ────────────────────────────────────────────────────
export type RestaurantListQuery     = z.infer<typeof restaurantListQuerySchema>;
export type RestaurantIdParam       = z.infer<typeof restaurantIdParamSchema>;
export type CreatePlanInput         = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput         = z.infer<typeof updatePlanSchema>;
export type PlanIdParam             = z.infer<typeof planIdParamSchema>;
export type FeatureFlagIdParam      = z.infer<typeof featureFlagIdParamSchema>;
export type UpdateFeatureFlagInput  = z.infer<typeof updateFeatureFlagSchema>;
export type AnalyticsQuery          = z.infer<typeof analyticsQuerySchema>;
export type SuperAdminAuditLogQuery = z.infer<typeof superAdminAuditLogQuerySchema>;
