// src/modules/restaurants/restaurants.routes.ts

import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import { UserRole } from '../../constants/roles';
import {
  updateRestaurantSettingsSchema,
  restaurantSlugParamSchema,
} from './restaurants.schema';
import {
  getPublicRestaurantController,
  getRestaurantOverviewController,
  getRestaurantSettingsController,
  updateRestaurantSettingsController,
} from './restaurants.controller';

const router = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

// GET /public/restaurants/:slug
router.get(
  '/public/restaurants/:slug',
  validate({ params: restaurantSlugParamSchema }),
  getPublicRestaurantController,
);

/*
|--------------------------------------------------------------------------
| ADMIN (Restaurant Admin + Super Admin)
|--------------------------------------------------------------------------
*/

const adminRoles = [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN];

// GET /admin/restaurant/overview
router.get(
  '/admin/restaurant/overview',
  requireAuth,
  roleGuard(...adminRoles),
  getRestaurantOverviewController,
);

// GET /admin/restaurant/settings
router.get(
  '/admin/restaurant/settings',
  requireAuth,
  roleGuard(...adminRoles),
  getRestaurantSettingsController,
);

// PATCH /admin/restaurant/settings
router.patch(
  '/admin/restaurant/settings',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ body: updateRestaurantSettingsSchema }),
  updateRestaurantSettingsController,
);

export default router;