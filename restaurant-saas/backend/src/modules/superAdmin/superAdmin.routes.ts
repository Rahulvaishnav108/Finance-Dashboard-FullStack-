// src/modules/superAdmin/superAdmin.routes.ts

import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  restaurantIdParamSchema,
  restaurantListQuerySchema,
  createPlanSchema,
  updatePlanSchema,
  planIdParamSchema,
  featureFlagIdParamSchema,
  updateFeatureFlagSchema,
  analyticsQuerySchema,
  superAdminAuditLogQuerySchema,
} from './superAdmin.schema';
import {
  getPlatformOverview,
  listRestaurants,
  getRestaurantById,
  approveRestaurant,
  suspendRestaurant,
  deleteRestaurant,
  createPlan,
  listPlans,
  updatePlan,
  listFeatureFlags,
  updateFeatureFlag,
  getRevenueAnalytics,
  getActiveTenantAnalytics,
  getSystemMonitoring,
  getPlatformAuditLogs,
} from './superAdmin.controller';

const router = Router();

/*
|--------------------------------------------------------------------------
| PLATFORM OVERVIEW
|--------------------------------------------------------------------------
*/

// GET /super-admin/platform/overview
router.get('/platform/overview', getPlatformOverview);

/*
|--------------------------------------------------------------------------
| RESTAURANT MANAGEMENT
|--------------------------------------------------------------------------
*/

// GET /super-admin/restaurants
router.get(
  '/restaurants',
  validate({ query: restaurantListQuerySchema }),
  listRestaurants,
);

// GET /super-admin/restaurants/:id
router.get(
  '/restaurants/:id',
  validate({ params: restaurantIdParamSchema }),
  getRestaurantById,
);

// PATCH /super-admin/restaurants/:id/approve
router.patch(
  '/restaurants/:id/approve',
  validate({ params: restaurantIdParamSchema }),
  approveRestaurant,
);

// PATCH /super-admin/restaurants/:id/suspend
router.patch(
  '/restaurants/:id/suspend',
  validate({ params: restaurantIdParamSchema }),
  suspendRestaurant,
);

// DELETE /super-admin/restaurants/:id
router.delete(
  '/restaurants/:id',
  validate({ params: restaurantIdParamSchema }),
  deleteRestaurant,
);

/*
|--------------------------------------------------------------------------
| PLANS
|--------------------------------------------------------------------------
*/

// POST /super-admin/plans
router.post(
  '/plans',
  validate({ body: createPlanSchema }),
  createPlan,
);

// GET /super-admin/plans
router.get('/plans', listPlans);

// PATCH /super-admin/plans/:id
router.patch(
  '/plans/:id',
  validate({ params: planIdParamSchema, body: updatePlanSchema }),
  updatePlan,
);

/*
|--------------------------------------------------------------------------
| FEATURE FLAGS
|--------------------------------------------------------------------------
*/

// GET /super-admin/feature-flags
router.get('/feature-flags', listFeatureFlags);

// PATCH /super-admin/feature-flags/:id
router.patch(
  '/feature-flags/:id',
  validate({ params: featureFlagIdParamSchema, body: updateFeatureFlagSchema }),
  updateFeatureFlag,
);

/*
|--------------------------------------------------------------------------
| ANALYTICS
|--------------------------------------------------------------------------
*/

// GET /super-admin/analytics/revenue
router.get(
  '/analytics/revenue',
  validate({ query: analyticsQuerySchema }),
  getRevenueAnalytics,
);

// GET /super-admin/analytics/tenants
router.get(
  '/analytics/tenants',
  validate({ query: analyticsQuerySchema }),
  getActiveTenantAnalytics,
);

/*
|--------------------------------------------------------------------------
| SYSTEM MONITORING
|--------------------------------------------------------------------------
*/

// GET /super-admin/system/monitoring
router.get('/system/monitoring', getSystemMonitoring);

/*
|--------------------------------------------------------------------------
| AUDIT LOGS (platform-wide)
|--------------------------------------------------------------------------
*/

// GET /super-admin/audit-logs
router.get(
  '/audit-logs',
  validate({ query: superAdminAuditLogQuerySchema }),
  getPlatformAuditLogs,
);

export default router;