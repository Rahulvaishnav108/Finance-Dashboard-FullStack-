import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { roles, type AppRole } from '../constants/roles';

export type RestaurantStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
export type TableSessionStatus = 'ACTIVE' | 'EXPIRED' | 'ENDED';

export type RestaurantSettings = {
  currency: string;
  taxRate: number;
  serviceChargeEnabled: boolean;
  sessionDurationMinutes: number;
};

export type RestaurantRecord = {
  id: string;
  slug: string;
  name: string;
  status: RestaurantStatus;
  plan: string;
  cuisine: string;
  city: string;
  rating: number;
  settings: RestaurantSettings;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: AppRole;
  restaurantId?: string;
  passwordHash: string;
  isActive: boolean;
};

export type AuthSessionRecord = {
  id: string;
  userId: string;
  refreshTokenId: string;
  deviceLabel: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type OtpRecord = {
  id: string;
  target: string;
  code: string;
  expiresAt: string;
  verifiedAt: string | null;
};

export type TableRecord = {
  id: string;
  restaurantId: string;
  name: string;
  number: number;
  floor: number;
  section: string;
  capacity: number;
  status: TableStatus;
  assignedStaffId: string | null;
  qrToken: string;
};

export type TableSessionRecord = {
  id: string;
  restaurantId: string;
  tableId: string;
  token: string;
  customerName: string;
  partySize: number;
  status: TableSessionStatus;
  createdAt: string;
  expiresAt: string;
  endedAt: string | null;
};

const createPasswordHash = (password: string) => bcrypt.hashSync(password, 10);
const nowIso = () => new Date().toISOString();

let sequence = 5000;
export function createEntityId(prefix: string): string {
  sequence += 1;
  return `${prefix}_${sequence}`;
}

export const phase1Store = {
  restaurants: [
    {
      id: 'rest_1',
      slug: 'amber-table',
      name: 'Amber Table',
      status: 'ACTIVE' as RestaurantStatus,
      plan: 'PRO',
      cuisine: 'Modern Indian',
      city: 'Bengaluru',
      rating: 4.7,
      settings: {
        currency: 'INR',
        taxRate: 0.05,
        serviceChargeEnabled: true,
        sessionDurationMinutes: 90,
      },
    },
  ] as RestaurantRecord[],
  users: [
    {
      id: 'usr_admin_1',
      name: 'Admin',
      email: 'admin@ambertable.com',
      mobile: '5555555555',
      role: roles.restaurantAdmin,
      restaurantId: 'rest_1',
      passwordHash: createPasswordHash('Admin@123'),
      isActive: true,
    },
    {
      id: 'usr_customer_1',
      name: 'Aarav Guest',
      email: 'guest@ambertable.com',
      mobile: '9999999999',
      role: roles.customer,
      restaurantId: 'rest_1',
      passwordHash: createPasswordHash('Guest@123'),
      isActive: true,
    },
    {
      id: 'usr_staff_1',
      name: 'Riya Service',
      email: 'staff@ambertable.com',
      mobile: '8888888888',
      role: roles.serviceStaff,
      restaurantId: 'rest_1',
      passwordHash: createPasswordHash('Staff@123'),
      isActive: true,
    },
    {
      id: 'usr_kitchen_1',
      name: 'Kabir Kitchen',
      email: 'kitchen@ambertable.com',
      mobile: '7777777777',
      role: roles.kitchenStaff,
      restaurantId: 'rest_1',
      passwordHash: createPasswordHash('Kitchen@123'),
      isActive: true,
    },
    {
      id: 'usr_cleaning_1',
      name: 'Meera Cleaning',
      email: 'cleaning@ambertable.com',
      mobile: '6666666666',
      role: roles.cleaningStaff,
      restaurantId: 'rest_1',
      passwordHash: createPasswordHash('Cleaning@123'),
      isActive: true,
    },
    {
      id: 'usr_super_1',
      name: 'Platform Owner',
      email: 'superadmin@graphura.com',
      mobile: '4444444444',
      role: roles.superAdmin,
      passwordHash: createPasswordHash('Super@123'),
      isActive: true,
    },
  ] as UserRecord[],
  authSessions: [] as AuthSessionRecord[],
  otps: [] as OtpRecord[],
  tables: [
    {
      id: 'tbl_1',
      restaurantId: 'rest_1',
      name: 'T1',
      number: 1,
      floor: 1,
      section: 'Main',
      capacity: 4,
      status: 'AVAILABLE' as TableStatus,
      assignedStaffId: null,
      qrToken: randomUUID(),
    },
    {
      id: 'tbl_2',
      restaurantId: 'rest_1',
      name: 'T2',
      number: 2,
      floor: 1,
      section: 'VIP',
      capacity: 6,
      status: 'OCCUPIED' as TableStatus,
      assignedStaffId: null,
      qrToken: randomUUID(),
    },
  ] as TableRecord[],
  tableSessions: [
    {
      id: 'ts_1',
      restaurantId: 'rest_1',
      tableId: 'tbl_2',
      token: randomUUID(),
      customerName: 'Walk-in Guest',
      partySize: 2,
      status: 'ACTIVE' as TableSessionStatus,
      createdAt: nowIso(),
      expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      endedAt: null,
    },
  ] as TableSessionRecord[],
};

export function getRestaurantById(restaurantId: string): RestaurantRecord | undefined {
  return phase1Store.restaurants.find((restaurant) => restaurant.id === restaurantId);
}

export function getRestaurantBySlug(slug: string): RestaurantRecord | undefined {
  return phase1Store.restaurants.find((restaurant) => restaurant.slug === slug);
}

export function getUserById(userId: string): UserRecord | undefined {
  return phase1Store.users.find((user) => user.id === userId);
}

export function getUserByEmailOrMobile(input: { email?: string; mobile?: string }): UserRecord | undefined {
  if (input.email) {
    return phase1Store.users.find((user) => user.email.toLowerCase() === input.email?.toLowerCase());
  }

  if (input.mobile) {
    return phase1Store.users.find((user) => user.mobile === input.mobile);
  }

  return undefined;
}

export function getTableById(tableId: string): TableRecord | undefined {
  return phase1Store.tables.find((table) => table.id === tableId);
}

export function getTableByQrToken(qrToken: string): TableRecord | undefined {
  return phase1Store.tables.find((table) => table.qrToken === qrToken);
}

export function isTableSessionExpired(session: TableSessionRecord): boolean {
  return session.status !== 'ACTIVE' || new Date(session.expiresAt).getTime() <= Date.now();
}

export function getTableSessionByToken(token: string): TableSessionRecord | undefined {
  return phase1Store.tableSessions.find((session) => session.token === token);
}
