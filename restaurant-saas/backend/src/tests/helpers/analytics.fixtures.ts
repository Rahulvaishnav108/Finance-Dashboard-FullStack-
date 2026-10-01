import mongoose from 'mongoose';
import { UserRole } from '../../constants/roles';
import { OrderStatus, Priority, TableStatus, UserStatus } from '../../constants/statuses';
import { BillingModel } from '../../modules/billing/billing.model';
import { BillStatus, PaymentMethod, PaymentStatus } from '../../modules/billing/billing.schema';
import { CustomerProfileModel } from '../../modules/analytics/customerProfile.model';
import { OrderModel } from '../../modules/orders/orders.model';
import { PaymentStatus as OrderPaymentStatus } from '../../modules/orders/orders.schema';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { TableModel } from '../../modules/tables/tables.model';
import { UserModel } from '../../modules/users/users.model';
import { signAccessToken } from '../../services/jwt.service';

function createOrderItem(name: string, price: number) {
  return {
    menuItemId: new mongoose.Types.ObjectId(),
    name,
    quantity: 1,
    price,
    totalPrice: price,
  };
}

function createAdminToken(restaurantId: string): string {
  return signAccessToken({
    _id: '507f1f77bcf86cd799439099',
    email: 'analytics.admin@example.com',
    role: UserRole.RESTAURANT_ADMIN,
    restaurantId,
  });
}

function createSuperAdminToken(): string {
  return signAccessToken({
    _id: '507f1f77bcf86cd799439100',
    email: 'analytics.superadmin@example.com',
    role: UserRole.SUPER_ADMIN,
  });
}

export async function seedAnalyticsContext() {
  const restaurant = await RestaurantModel.create({
    slug: 'analytics-hub',
    name: 'Analytics Hub',
    plan: 'PRO',
    cuisine: 'Fusion',
    city: 'Delhi',
  });

  await TableModel.create([
    {
      restaurantId: restaurant._id,
      tableNumber: 'A1',
      capacity: 4,
      floor: 1,
      section: 'Main',
      status: TableStatus.AVAILABLE,
      qrCode: 'analytics-qr-a1',
      qrToken: 'analytics-qr-a1-token',
    },
    {
      restaurantId: restaurant._id,
      tableNumber: 'A2',
      capacity: 4,
      floor: 1,
      section: 'Main',
      status: TableStatus.RESERVED,
      qrCode: 'analytics-qr-a2',
      qrToken: 'analytics-qr-a2-token',
    },
    {
      restaurantId: restaurant._id,
      tableNumber: 'B1',
      capacity: 6,
      floor: 1,
      section: 'VIP',
      status: TableStatus.OCCUPIED,
      qrCode: 'analytics-qr-b1',
      qrToken: 'analytics-qr-b1-token',
    },
    {
      restaurantId: restaurant._id,
      tableNumber: 'B2',
      capacity: 4,
      floor: 2,
      section: 'VIP',
      status: TableStatus.PAYMENT_PENDING,
      qrCode: 'analytics-qr-b2',
      qrToken: 'analytics-qr-b2-token',
    },
    {
      restaurantId: restaurant._id,
      tableNumber: 'C1',
      capacity: 2,
      floor: 2,
      section: 'Patio',
      status: TableStatus.NEEDS_CLEANING,
      qrCode: 'analytics-qr-c1',
      qrToken: 'analytics-qr-c1-token',
    },
    {
      restaurantId: restaurant._id,
      tableNumber: 'C2',
      capacity: 2,
      floor: 2,
      section: 'Patio',
      status: TableStatus.CLEANING_IN_PROGRESS,
      qrCode: 'analytics-qr-c2',
      qrToken: 'analytics-qr-c2-token',
    },
    {
      restaurantId: restaurant._id,
      tableNumber: 'Z9',
      capacity: 8,
      floor: 3,
      section: 'Archive',
      status: TableStatus.AVAILABLE,
      qrCode: 'analytics-qr-z9',
      qrToken: 'analytics-qr-z9-token',
      isActive: false,
    },
  ]);

  const kitchenStaffOneId = new mongoose.Types.ObjectId();
  const kitchenStaffTwoId = new mongoose.Types.ObjectId();
  const kitchenStaffThreeId = new mongoose.Types.ObjectId();

  await UserModel.create([
    {
      _id: kitchenStaffOneId,
      name: 'Kitchen One',
      email: 'kitchen.one@example.com',
      mobile: '9999900011',
      role: UserRole.KITCHEN_STAFF,
      status: UserStatus.ACTIVE,
      restaurantId: restaurant._id,
    },
    {
      _id: kitchenStaffTwoId,
      name: 'Kitchen Two',
      email: 'kitchen.two@example.com',
      mobile: '9999900012',
      role: UserRole.KITCHEN_STAFF,
      status: UserStatus.ACTIVE,
      restaurantId: restaurant._id,
    },
    {
      _id: kitchenStaffThreeId,
      name: 'Kitchen Three',
      email: 'kitchen.three@example.com',
      mobile: '9999900013',
      role: UserRole.KITCHEN_STAFF,
      status: UserStatus.INACTIVE,
      restaurantId: restaurant._id,
    },
  ]);

  await BillingModel.create([
    {
      restaurantId: restaurant._id,
      orderIds: [new mongoose.Types.ObjectId()],
      subtotal: 90,
      taxAmount: 10,
      serviceCharge: 0,
      discountAmount: 5,
      finalAmount: 95,
      paymentMethod: PaymentMethod.UPI,
      paymentStatus: PaymentStatus.PAID,
      status: BillStatus.PAID,
      paidAt: new Date('2026-01-05T12:00:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderIds: [new mongoose.Types.ObjectId()],
      subtotal: 180,
      taxAmount: 20,
      serviceCharge: 0,
      discountAmount: 0,
      finalAmount: 200,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.PAID,
      status: BillStatus.PAID,
      paidAt: new Date('2026-01-12T14:30:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderIds: [new mongoose.Types.ObjectId()],
      subtotal: 145,
      taxAmount: 15,
      serviceCharge: 0,
      discountAmount: 10,
      finalAmount: 150,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PAID,
      status: BillStatus.PAID,
      paidAt: new Date('2026-01-12T18:15:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderIds: [new mongoose.Types.ObjectId()],
      subtotal: 140,
      taxAmount: 10,
      serviceCharge: 0,
      discountAmount: 0,
      finalAmount: 150,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PAID,
      status: BillStatus.PAID,
      paidAt: new Date('2026-02-03T09:15:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderIds: [new mongoose.Types.ObjectId()],
      subtotal: 275,
      taxAmount: 25,
      serviceCharge: 0,
      discountAmount: 0,
      finalAmount: 300,
      paymentMethod: PaymentMethod.ONLINE,
      paymentStatus: PaymentStatus.PENDING,
      status: BillStatus.GENERATED,
      paidAt: null,
    },
  ]);

  await CustomerProfileModel.create([
    {
      mobile: '9999900001',
      name: 'Aarav',
      totalVisits: 5,
      totalSpent: 4200,
      firstVisitAt: new Date('2025-12-20T10:00:00.000Z'),
      lastVisitAt: new Date('2026-01-18T19:00:00.000Z'),
      restaurantsVisited: [restaurant._id],
    },
    {
      mobile: '9999900002',
      name: 'Mira',
      totalVisits: 1,
      totalSpent: 850,
      firstVisitAt: new Date('2026-01-10T09:00:00.000Z'),
      lastVisitAt: new Date('2026-01-10T09:00:00.000Z'),
      restaurantsVisited: [restaurant._id],
    },
    {
      mobile: '9999900003',
      name: 'Kabir',
      totalVisits: 3,
      totalSpent: 2750,
      firstVisitAt: new Date('2025-11-02T18:00:00.000Z'),
      lastVisitAt: new Date('2026-02-02T21:15:00.000Z'),
      restaurantsVisited: [restaurant._id],
    },
    {
      mobile: '9999900004',
      name: 'Sia',
      totalVisits: 2,
      totalSpent: 1900,
      firstVisitAt: new Date('2025-12-28T20:00:00.000Z'),
      lastVisitAt: new Date('2026-01-28T20:30:00.000Z'),
      restaurantsVisited: [restaurant._id],
    },
  ]);

  await OrderModel.create([
    {
      restaurantId: restaurant._id,
      orderNumber: 'AN-001',
      items: [createOrderItem('Paneer Tikka', 95)],
      totalAmount: 90,
      taxAmount: 5,
      discountAmount: 0,
      finalAmount: 95,
      status: OrderStatus.READY,
      priority: Priority.NORMAL,
      paymentStatus: OrderPaymentStatus.PAID,
      kitchenStaffId: kitchenStaffOneId,
      acceptedAt: new Date('2026-01-05T12:10:00.000Z'),
      readyAt: new Date('2026-01-05T12:30:00.000Z'),
      createdAt: new Date('2026-01-05T12:05:00.000Z'),
      updatedAt: new Date('2026-01-05T12:30:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderNumber: 'AN-002',
      items: [createOrderItem('Pasta', 130)],
      totalAmount: 120,
      taxAmount: 10,
      discountAmount: 0,
      finalAmount: 130,
      status: OrderStatus.REJECTED,
      priority: Priority.NORMAL,
      paymentStatus: OrderPaymentStatus.PENDING,
      kitchenStaffId: kitchenStaffOneId,
      acceptedAt: new Date('2026-01-05T12:25:00.000Z'),
      rejectedAt: new Date('2026-01-05T12:40:00.000Z'),
      createdAt: new Date('2026-01-05T12:20:00.000Z'),
      updatedAt: new Date('2026-01-05T12:40:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderNumber: 'AN-003',
      items: [createOrderItem('Burger', 200)],
      totalAmount: 180,
      taxAmount: 20,
      discountAmount: 0,
      finalAmount: 200,
      status: OrderStatus.READY,
      priority: Priority.HIGH,
      paymentStatus: OrderPaymentStatus.PAID,
      kitchenStaffId: kitchenStaffTwoId,
      acceptedAt: new Date('2026-01-10T14:05:00.000Z'),
      readyAt: new Date('2026-01-10T14:30:00.000Z'),
      createdAt: new Date('2026-01-10T14:00:00.000Z'),
      updatedAt: new Date('2026-01-10T14:30:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderNumber: 'AN-004',
      items: [createOrderItem('Soup', 150)],
      totalAmount: 135,
      taxAmount: 15,
      discountAmount: 0,
      finalAmount: 150,
      status: OrderStatus.DELAYED,
      priority: Priority.NORMAL,
      paymentStatus: OrderPaymentStatus.PENDING,
      kitchenStaffId: kitchenStaffTwoId,
      acceptedAt: new Date('2026-02-03T14:15:00.000Z'),
      delayedAt: new Date('2026-02-03T14:40:00.000Z'),
      createdAt: new Date('2026-02-03T14:10:00.000Z'),
      updatedAt: new Date('2026-02-03T14:40:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderNumber: 'AN-005',
      items: [createOrderItem('Biryani', 150)],
      totalAmount: 135,
      taxAmount: 15,
      discountAmount: 0,
      finalAmount: 150,
      status: OrderStatus.CANCELLED,
      priority: Priority.NORMAL,
      paymentStatus: OrderPaymentStatus.FAILED,
      kitchenStaffId: kitchenStaffOneId,
      createdAt: new Date('2026-01-12T12:45:00.000Z'),
      updatedAt: new Date('2026-01-12T12:50:00.000Z'),
    },
    {
      restaurantId: restaurant._id,
      orderNumber: 'AN-006',
      items: [createOrderItem('Pizza', 180)],
      totalAmount: 165,
      taxAmount: 15,
      discountAmount: 0,
      finalAmount: 180,
      status: OrderStatus.READY,
      priority: Priority.NORMAL,
      paymentStatus: OrderPaymentStatus.PAID,
      kitchenStaffId: kitchenStaffOneId,
      preparingStartedAt: new Date('2026-01-20T18:10:00.000Z'),
      readyAt: new Date('2026-01-20T18:40:00.000Z'),
      createdAt: new Date('2026-01-20T18:00:00.000Z'),
      updatedAt: new Date('2026-01-20T18:40:00.000Z'),
    },
  ]);

  return {
    adminToken: createAdminToken(restaurant.id),
    restaurantId: restaurant.id,
    superAdminToken: createSuperAdminToken(),
  };
}
