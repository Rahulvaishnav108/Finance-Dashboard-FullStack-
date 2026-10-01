export enum UserRole {
  CUSTOMER = 'customer',
  SERVICE_STAFF = 'service-staff',
  KITCHEN_STAFF = 'kitchen-staff',
  CLEANING_STAFF = 'cleaning-staff',
  RESTAURANT_ADMIN = 'restaurant-admin',
  SUPER_ADMIN = 'super-admin',
}

// ── Internal role enums (sub-roles within each operational panel) ──────

export enum KitchenRole {
  CHEF = 'CHEF',
  KITCHEN_SUPERVISOR = 'KITCHEN_SUPERVISOR',
  HEAD_CHEF = 'HEAD_CHEF',
}

export enum StaffInternalRole {
  WAITER = 'WAITER',
  FLOOR_STAFF = 'FLOOR_STAFF',
  FLOOR_SUPERVISOR = 'FLOOR_SUPERVISOR',
}

export enum CleaningRole {
  CLEANING_STAFF = 'CLEANING_STAFF',
  HOUSEKEEPING = 'HOUSEKEEPING',
  CLEANING_SUPERVISOR = 'CLEANING_SUPERVISOR',
}

// ── Panel identifiers (used in JWT and cookie names) ──────────────────

export type Panel = 'customer' | 'kitchen' | 'staff' | 'cleaning' | 'admin' | 'superadmin';

export const USER_ROLE_TO_PANEL: Record<UserRole, Panel> = {
  [UserRole.CUSTOMER]: 'customer',
  [UserRole.KITCHEN_STAFF]: 'kitchen',
  [UserRole.SERVICE_STAFF]: 'staff',
  [UserRole.CLEANING_STAFF]: 'cleaning',
  [UserRole.RESTAURANT_ADMIN]: 'admin',
  [UserRole.SUPER_ADMIN]: 'superadmin',
};

export const PANEL_TO_USER_ROLE: Record<Panel, UserRole> = {
  customer: UserRole.CUSTOMER,
  kitchen: UserRole.KITCHEN_STAFF,
  staff: UserRole.SERVICE_STAFF,
  cleaning: UserRole.CLEANING_STAFF,
  admin: UserRole.RESTAURANT_ADMIN,
  superadmin: UserRole.SUPER_ADMIN,
};

// ── Convenience lookups ───────────────────────────────────────────────

export const roles = {
  customer: UserRole.CUSTOMER,
  serviceStaff: UserRole.SERVICE_STAFF,
  kitchenStaff: UserRole.KITCHEN_STAFF,
  cleaningStaff: UserRole.CLEANING_STAFF,
  restaurantAdmin: UserRole.RESTAURANT_ADMIN,
  superAdmin: UserRole.SUPER_ADMIN,
} as const;

export type AppRole = (typeof roles)[keyof typeof roles];

export const RESTAURANT_ROLES = [
  UserRole.RESTAURANT_ADMIN,
  UserRole.SERVICE_STAFF,
  UserRole.KITCHEN_STAFF,
  UserRole.CLEANING_STAFF,
] as const;

export const STAFF_ROLES = [
  UserRole.SERVICE_STAFF,
  UserRole.KITCHEN_STAFF,
  UserRole.CLEANING_STAFF,
] as const;

export const ADMIN_ROLES = [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN] as const;
