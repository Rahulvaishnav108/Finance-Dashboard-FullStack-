// src/constants/permissions.ts
// Role-based permission matrix — staff/admin only (customers use session auth)

import { UserRole } from './roles';

/** Route-level permission groups */
export const RoutePermissions = {
  // Public — no auth required
  PUBLIC: [] as UserRole[],

  // Any authenticated staff/admin user
  AUTHENTICATED: [
    UserRole.SERVICE_STAFF,
    UserRole.KITCHEN_STAFF,
    UserRole.CLEANING_STAFF,
    UserRole.RESTAURANT_ADMIN,
    UserRole.SUPER_ADMIN,
  ],

  // Service staff
  SERVICE_STAFF: [UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN],

  // Kitchen staff
  KITCHEN_STAFF: [UserRole.KITCHEN_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN],

  // Cleaning staff
  CLEANING_STAFF: [UserRole.CLEANING_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN],

  // Any staff member
  ANY_STAFF: [
    UserRole.SERVICE_STAFF,
    UserRole.KITCHEN_STAFF,
    UserRole.CLEANING_STAFF,
    UserRole.RESTAURANT_ADMIN,
    UserRole.SUPER_ADMIN,
  ],

  // Restaurant admin and above
  RESTAURANT_ADMIN: [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN],

  // Super admin only
  SUPER_ADMIN: [UserRole.SUPER_ADMIN],
} as const;
