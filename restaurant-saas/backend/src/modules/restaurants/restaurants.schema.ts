// src/modules/restaurants/restaurants.schema.ts
// Zod validation schemas for the restaurants module.

import { z } from 'zod';

// ── PATCH /admin/restaurant/settings ─────────────────────────────────
// All fields are optional — admin can update one or all settings at once
export const updateRestaurantSettingsSchema = z.object({
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter ISO code')
    .toUpperCase()
    .optional(),

  taxRate: z
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(1, 'Tax rate must be a decimal between 0 and 1 (e.g. 0.05 for 5%)')
    .optional(),

  serviceChargeEnabled: z
    .boolean()
    .optional(),

  sessionDurationMinutes: z
    .number()
    .int()
    .min(15, 'Session duration must be at least 15 minutes')
    .max(480, 'Session duration cannot exceed 480 minutes')
    .optional(),

  emailPreferences: z
    .object({
      dailySalesReports: z.boolean().optional(),
      inventoryAlerts: z.boolean().optional(),
      staffNotifications: z.boolean().optional(),
    })
    .optional(),

  branding: z
    .object({
      logo: z.string().trim().optional(),
      primaryColor: z.string().trim().optional(),
      secondaryColor: z.string().trim().optional(),
      footerText: z.string().trim().optional(),
      website: z.string().trim().optional(),
      supportEmail: z.string().trim().optional(),
      supportPhone: z.string().trim().optional(),
    })
    .optional(),

  timezone: z.string().trim().optional(),
  dateFormat: z.string().trim().optional(),
  timeFormat: z.string().trim().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field is required',
  path: ['unknown'],
});

// ── GET /public/restaurants/:slug ─────────────────────────────────────
export const restaurantSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
});

// ── Exported types ────────────────────────────────────────────────────
export type UpdateRestaurantSettingsInput = z.infer<typeof updateRestaurantSettingsSchema>;
export type RestaurantSlugParam = z.infer<typeof restaurantSlugParamSchema>;