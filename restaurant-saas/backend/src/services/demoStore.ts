import { roles, type AppRole } from '../constants/roles';

type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: AppRole;
  restaurantId?: string;
};

type Session = {
  id: string;
  userId: string;
  device: string;
  createdAt: string;
  lastActiveAt: string;
};

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED' | 'DELAYED';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED';
export type CleaningStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
export type Table = {
  id: string;
  restaurantId: string;
  name: string;
  number: number;
  floor: number;
  section: string;
  capacity: number;
  status: TableStatus;
  assignedStaffId: string | null;
};
export type Order = {
  id: string;
  restaurantId: string;
  sessionId: string;
  tableId: string;
  status: OrderStatus;
  priority: string;
  batchId: string | null;
  total: number;
  createdAt: string;
  picked: boolean;
  served: boolean;
};

const now = new Date();
const isoNow = () => new Date().toISOString();

let sequence = 1000;
export function createId(prefix: string): string {
  sequence += 1;
  return `${prefix}_${sequence}`;
}

export const store = {
  users: [
    {
      id: 'usr_customer_1',
      name: 'Aarav Guest',
      email: 'guest@ambertable.com',
      mobile: '9999999999',
      role: roles.customer,
      restaurantId: 'rest_1',
    },
    {
      id: 'usr_staff_1',
      name: 'Riya Service',
      email: 'staff@ambertable.com',
      mobile: '8888888888',
      role: roles.serviceStaff,
      restaurantId: 'rest_1',
    },
    {
      id: 'usr_kitchen_1',
      name: 'Kabir Kitchen',
      email: 'kitchen@ambertable.com',
      mobile: '7777777777',
      role: roles.kitchenStaff,
      restaurantId: 'rest_1',
    },
    {
      id: 'usr_cleaning_1',
      name: 'Meera Cleaning',
      email: 'cleaning@ambertable.com',
      mobile: '6666666666',
      role: roles.cleaningStaff,
      restaurantId: 'rest_1',
    },
    {
      id: 'usr_admin_1',
      name: 'Admin',
      email: 'admin@ambertable.com',
      mobile: '5555555555',
      role: roles.restaurantAdmin,
      restaurantId: 'rest_1',
    },
    {
      id: 'usr_super_1',
      name: 'Platform Owner',
      email: 'superadmin@graphura.com',
      mobile: '4444444444',
      role: roles.superAdmin,
    },
  ] satisfies User[],
  sessions: [
    {
      id: 'sess_1',
      userId: 'usr_admin_1',
      device: 'Chrome on Windows',
      createdAt: isoNow(),
      lastActiveAt: isoNow(),
    },
  ] satisfies Session[],
  restaurants: [
    {
      id: 'rest_1',
      slug: 'amber-table',
      name: 'Amber Table',
      status: 'ACTIVE',
      plan: 'PRO',
      cuisine: 'Modern Indian',
      city: 'Bengaluru',
      rating: 4.7,
      settings: {
        taxRate: 0.05,
        currency: 'INR',
        serviceChargeEnabled: true,
      },
    },
    {
      id: 'rest_2',
      slug: 'pepper-harbor',
      name: 'Pepper Harbor',
      status: 'PENDING',
      plan: 'STARTER',
      cuisine: 'Italian',
      city: 'Mumbai',
      rating: 4.3,
      settings: {
        taxRate: 0.05,
        currency: 'INR',
        serviceChargeEnabled: false,
      },
    },
  ],
  tables: [
    { id: 'tbl_1', restaurantId: 'rest_1', name: 'T1', number: 1, floor: 1, section: 'Main', capacity: 4, status: 'AVAILABLE' as TableStatus, assignedStaffId: 'usr_staff_1' as string | null },
    { id: 'tbl_2', restaurantId: 'rest_1', name: 'T2', number: 2, floor: 1, section: 'VIP', capacity: 6, status: 'OCCUPIED' as TableStatus, assignedStaffId: 'usr_staff_1' as string | null },
    { id: 'tbl_3', restaurantId: 'rest_1', name: 'T3', number: 12, floor: 2, section: 'Rooftop', capacity: 2, status: 'CLEANING' as TableStatus, assignedStaffId: 'usr_staff_1' as string | null },
  ] as Table[],
  tableSessions: [
    {
      id: 'ts_1',
      restaurantId: 'rest_1',
      tableId: 'tbl_2',
      token: 'table-session-token-1',
      expiresAt: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
      active: true,
      customerName: 'Aarav Guest',
    },
    {
      id: 'ts_expired_1',
      restaurantId: 'rest_1',
      tableId: 'tbl_1',
      token: 'expired-session-token',
      expiresAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      active: false,
      customerName: 'Old Guest',
    },
  ],
  reservations: [
    { id: 'res_1', restaurantId: 'rest_1', customerName: 'Ishita Shah', guests: 4, date: '2026-05-11', slot: '20:00', status: 'BOOKED', tableId: 'tbl_1' },
    { id: 'res_2', restaurantId: 'rest_1', customerName: 'Dev Patel', guests: 2, date: '2026-05-11', slot: '21:00', status: 'CHECKED_IN', tableId: 'tbl_2' },
  ],
  queueEntries: [
    { id: 'queue_1', restaurantId: 'rest_1', customerName: 'Walk-in Singh', guests: 3, priority: 'MEDIUM', status: 'WAITING', etaMinutes: 12 },
  ],
  menuCategories: [
    { id: 'cat_1', restaurantId: 'rest_1', name: 'starter' },
    { id: 'cat_2', restaurantId: 'rest_1', name: 'pizza' },
    { id: 'cat_3', restaurantId: 'rest_1', name: 'dessert' },
  ],
  menuItems: [
    { id: 'item_1', restaurantId: 'rest_1', category: 'starter', name: 'Tandoori Broccoli', veg: true, available: true, popular: true, recommended: true, price: 320, spicy: false, description: 'Charred broccoli with hung curd glaze.' },
    { id: 'item_2', restaurantId: 'rest_1', category: 'pizza', name: 'Truffle Mushroom Pizza', veg: true, available: true, popular: true, recommended: false, price: 640, spicy: false, description: 'Wood-fired pizza with truffle cream.' },
    { id: 'item_3', restaurantId: 'rest_1', category: 'pizza', name: 'Chicken Pepperoni Pizza', veg: false, available: true, popular: false, recommended: true, price: 720, spicy: true, description: 'Pepperoni pizza with smoked mozzarella.' },
    { id: 'item_4', restaurantId: 'rest_1', category: 'dessert', name: 'Saffron Tres Leches', veg: true, available: false, popular: false, recommended: true, price: 280, spicy: false, description: 'Soft cake soaked in saffron milk.' },
  ],
  cart: [
    { id: 'cart_1', sessionId: 'ts_1', itemId: 'item_2', quantity: 1, addOns: ['extra-cheese'], note: 'well done crust' },
  ],
  orders: [
    { id: 'ord_1', restaurantId: 'rest_1', sessionId: 'ts_1', tableId: 'tbl_2', status: 'PREPARING' as OrderStatus, priority: 'HIGH', batchId: 'batch_1', total: 640, createdAt: isoNow(), picked: false, served: false },
    { id: 'ord_2', restaurantId: 'rest_1', sessionId: 'ts_1', tableId: 'tbl_2', status: 'READY' as OrderStatus, priority: 'MEDIUM', batchId: 'batch_1', total: 320, createdAt: isoNow(), picked: false, served: false },
  ] as Order[],
  kitchenBatches: [
    { id: 'batch_1', restaurantId: 'rest_1', name: 'Rush Batch A', orderIds: ['ord_1', 'ord_2'], status: 'ACTIVE', station: 'Hot Line' },
  ],
  staffRequests: [
    { id: 'req_1', restaurantId: 'rest_1', sessionId: 'ts_1', type: 'waiter', status: 'PENDING' as RequestStatus, priority: 'HIGH', tableId: 'tbl_2' },
    { id: 'req_2', restaurantId: 'rest_1', sessionId: 'ts_1', type: 'water', status: 'ACCEPTED' as RequestStatus, priority: 'MEDIUM', tableId: 'tbl_2' },
  ],
  cleaningTasks: [
    { id: 'clean_1', restaurantId: 'rest_1', tableId: 'tbl_3', priority: 'HIGH', status: 'PENDING' as CleaningStatus, verifiedBy: null as string | null },
  ],
  offers: [
    { id: 'offer_1', restaurantId: 'rest_1', name: 'Lunch Saver', code: 'LUNCH10', discountPercent: 10, active: true },
  ],
  loyaltyRules: [
    { id: 'loyalty_1', restaurantId: 'rest_1', name: 'Silver Diner', pointsPer100: 10 },
  ],
  feedback: [
    { id: 'fb_1', restaurantId: 'rest_1', sessionId: 'ts_1', rating: 5, comment: 'Fast service and great pizza.' },
  ],
  notifications: [
    { id: 'noti_1', userId: 'usr_admin_1', title: 'Low stock alert', message: 'Mozzarella below threshold.', read: false, createdAt: isoNow() },
    { id: 'noti_2', userId: 'usr_staff_1', title: 'New waiter request', message: 'Table T2 requested assistance.', read: false, createdAt: isoNow() },
  ],
  payments: [
    { id: 'pay_1', orderId: 'ord_1', status: 'PENDING', amount: 640, method: 'UPI' },
  ],
  inventoryItems: [
    { id: 'inv_1', restaurantId: 'rest_1', name: 'Mozzarella', stock: 4, unit: 'kg', threshold: 5 },
    { id: 'inv_2', restaurantId: 'rest_1', name: 'Broccoli', stock: 14, unit: 'kg', threshold: 3 },
  ],
  plans: [
    { id: 'plan_1', name: 'STARTER', priceMonthly: 4999, tenantLimit: 1 },
    { id: 'plan_2', name: 'PRO', priceMonthly: 12999, tenantLimit: 5 },
  ],
  featureFlags: [
    { id: 'flag_1', key: 'smart-recommendations', enabled: true },
    { id: 'flag_2', key: 'otp-login', enabled: true },
  ],
  auditLogs: [
    { id: 'audit_1', actorId: 'usr_super_1', action: 'APPROVE_RESTAURANT', entityId: 'rest_1', createdAt: isoNow() },
    { id: 'audit_2', actorId: 'usr_admin_1', action: 'UPDATE_MENU', entityId: 'item_2', createdAt: isoNow() },
  ],
};

export function findUserByRole(role: AppRole): User {
  return store.users.find((user) => user.role === role) ?? store.users[0];
}

export function findRestaurantById(restaurantId: string) {
  return store.restaurants.find((restaurant) => restaurant.id === restaurantId);
}

export function getCurrentSession() {
  return store.tableSessions.find((session) => session.active) ?? store.tableSessions[0];
}

export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

export function getCurrentCustomerSession() {
  const session = getCurrentSession();
  const table = store.tables.find((entry) => entry.id === session.tableId);
  return {
    ...session,
    table,
    expired: isSessionExpired(session.expiresAt),
  };
}
