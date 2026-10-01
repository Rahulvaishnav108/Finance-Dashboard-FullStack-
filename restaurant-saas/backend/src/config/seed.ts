import mongoose from 'mongoose';
import crypto from 'crypto';
import logger from './logger';
import { hashPassword } from '../utils/crypto';
import { UserRole, KitchenRole, StaffInternalRole, CleaningRole } from '../constants/roles';
import {
  BatchStatus,
  CleaningStatus,
  PaymentStatus,
  Priority,
  QueueStatus,
  RequestStatus,
  RequestType,
  ReservationStatus,
  RestaurantStatus,
  SessionStatus,
  TableStatus,
  UserStatus,
} from '../constants/statuses';
import { UserModel } from '../modules/users/users.model';
import { RestaurantModel } from '../modules/restaurants/restaurants.model';
import { TableModel } from '../modules/tables/tables.model';
import { TableSessionModel } from '../modules/tableSessions/tableSessions.model';
import { Category, MenuItem } from '../modules/menu/menu.model';
import { OrderModel } from '../modules/orders/orders.model';
import {
  OrderStatus as OrderDocumentStatus,
  PaymentStatus as OrderPaymentStatus,
} from '../modules/orders/orders.schema';
import { NotificationModel } from '../modules/notifications/notifications.model';
import { NotificationCategory, NotificationPriority } from '../modules/notifications/notifications.schema';
import { QueueEntryModel } from '../modules/queue/queue.model';
import { ReservationModel } from '../modules/reservations/reservations.model';
import { StaffRequestModel } from '../modules/staff/staffRequest.model';
import { CleaningTaskModel } from '../modules/cleaning/cleaning.model';
import { OfferModel } from '../modules/offers/offers.model';
import { AuditLogModel } from '../modules/auditLogs/auditLogs.model';
import { FeatureFlagModel, PlatformPlanModel } from '../modules/superAdmin/superAdmin.model';
import { KitchenBatchModel } from '../modules/kitchen/kitchen.model';
import { PaymentModel } from '../modules/payments/payments.model';

type SeedUserInput = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  restaurantId?: mongoose.Types.ObjectId;
  kitchen_role?: KitchenRole;
  staff_role?: StaffInternalRole;
  cleaning_role?: CleaningRole;
};

async function upsertUser(input: SeedUserInput) {
  const password = await hashPassword(input.password);

  return UserModel.findOneAndUpdate(
    { email: input.email.toLowerCase() },
    {
      $set: {
        name: input.name,
        email: input.email.toLowerCase(),
        mobile: input.mobile,
        password,
        role: input.role,
        status: UserStatus.ACTIVE,
        restaurantId: input.restaurantId ?? null,
        kitchen_role: input.kitchen_role ?? null,
        staff_role: input.staff_role ?? null,
        cleaning_role: input.cleaning_role ?? null,
        isEmailVerified: true,
        isMobileVerified: true,
        isDeleted: false,
        deletedAt: null,
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
}

function buildOrderItem(menuItem: { _id: mongoose.Types.ObjectId; name: string; price: number }, quantity: number) {
  return {
    menuItemId: menuItem._id,
    name: menuItem.name,
    quantity,
    price: menuItem.price,
    totalPrice: menuItem.price * quantity,
    notes: '',
  };
}

export async function seedDevelopmentData(): Promise<void> {
  const amberTable = await RestaurantModel.findOneAndUpdate(
    { slug: 'amber-table' },
    {
      $set: {
        name: 'Amber Table',
        slug: 'amber-table',
        status: RestaurantStatus.ACTIVE,
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
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await RestaurantModel.findOneAndUpdate(
    { slug: 'pepper-harbor' },
    {
      $set: {
        name: 'Pepper Harbor',
        slug: 'pepper-harbor',
        status: RestaurantStatus.PENDING_APPROVAL,
        plan: 'STARTER',
        cuisine: 'Italian',
        city: 'Mumbai',
        rating: 4.3,
        settings: {
          currency: 'INR',
          taxRate: 0.05,
          serviceChargeEnabled: false,
          sessionDurationMinutes: 90,
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const [adminUser, customerUser, staffUser, , , superAdminUser] = await Promise.all([
    upsertUser({
      name: 'Admin',
      email: 'admin@ambertable.com',
      mobile: '5555555555',
      password: 'Admin@123',
      role: UserRole.RESTAURANT_ADMIN,
      restaurantId: amberTable._id,
    }),
    upsertUser({
      name: 'Aarav Guest',
      email: 'guest@ambertable.com',
      mobile: '9999999999',
      password: 'Guest@123',
      role: UserRole.CUSTOMER,
      restaurantId: amberTable._id,
    }),
    upsertUser({
      name: 'Riya Service',
      email: 'staff@ambertable.com',
      mobile: '8888888888',
      password: 'Staff@123',
      role: UserRole.SERVICE_STAFF,
      restaurantId: amberTable._id,
      staff_role: StaffInternalRole.FLOOR_SUPERVISOR,
    }),
    upsertUser({
      name: 'Kabir Kitchen',
      email: 'kitchen@ambertable.com',
      mobile: '7777777777',
      password: 'Kitchen@123',
      role: UserRole.KITCHEN_STAFF,
      restaurantId: amberTable._id,
      kitchen_role: KitchenRole.HEAD_CHEF,
    }),
    upsertUser({
      name: 'Meera Cleaning',
      email: 'cleaning@ambertable.com',
      mobile: '6666666666',
      password: 'Cleaning@123',
      role: UserRole.CLEANING_STAFF,
      restaurantId: amberTable._id,
      cleaning_role: CleaningRole.CLEANING_SUPERVISOR,
    }),
    upsertUser({
      name: 'Platform Owner',
      email: 'superadmin@graphura.com',
      mobile: '4444444444',
      password: 'Super@123',
      role: UserRole.SUPER_ADMIN,
    }),
  ]);

  await Promise.all([
    PlatformPlanModel.findOneAndUpdate(
      { name: 'STARTER' },
      { $set: { name: 'STARTER', priceMonthly: 4999, tenantLimit: 1, usageLimit: 100 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    PlatformPlanModel.findOneAndUpdate(
      { name: 'PRO' },
      { $set: { name: 'PRO', priceMonthly: 12999, tenantLimit: 5, usageLimit: 1000 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    PlatformPlanModel.findOneAndUpdate(
      { name: 'ENTERPRISE' },
      { $set: { name: 'ENTERPRISE', priceMonthly: 24999, tenantLimit: 20, usageLimit: 10000 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    FeatureFlagModel.findOneAndUpdate(
      { key: 'smart-recommendations' },
      { $set: { key: 'smart-recommendations', enabled: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    FeatureFlagModel.findOneAndUpdate(
      { key: 'otp-login' },
      { $set: { key: 'otp-login', enabled: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
  ]);

  const [tableOne, tableTwo, tableThree] = await Promise.all([
    TableModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableNumber: 'T1' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableNumber: 'T1',
          capacity: 4,
          status: TableStatus.AVAILABLE,
          qrCode: 'amber-table-t1-seed',
          floor: 1,
          section: 'Indoor',
          isActive: true,
        },
        $setOnInsert: {
          qrToken: crypto.randomBytes(16).toString('hex'),
          qrGeneratedAt: new Date(),
          qrLastRegeneratedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    TableModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableNumber: 'T2' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableNumber: 'T2',
          capacity: 6,
          status: TableStatus.OCCUPIED,
          qrCode: 'amber-table-t2-seed',
          floor: 1,
          section: 'Indoor',
          isActive: true,
        },
        $setOnInsert: {
          qrToken: crypto.randomBytes(16).toString('hex'),
          qrGeneratedAt: new Date(),
          qrLastRegeneratedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    TableModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableNumber: 'T3' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableNumber: 'T3',
          capacity: 2,
          status: TableStatus.NEEDS_CLEANING,
          qrCode: 'amber-table-t3-seed',
          floor: 1,
          section: 'Indoor',
          isActive: true,
        },
        $setOnInsert: {
          qrToken: crypto.randomBytes(16).toString('hex'),
          qrGeneratedAt: new Date(),
          qrLastRegeneratedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    TableModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableNumber: 'T4' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableNumber: 'T4',
          capacity: 8,
          status: TableStatus.RESERVED,
          qrCode: 'amber-table-t4-seed',
          floor: 1,
          section: 'Private',
          isActive: true,
        },
        $setOnInsert: {
          qrToken: crypto.randomBytes(16).toString('hex'),
          qrGeneratedAt: new Date(),
          qrLastRegeneratedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    TableModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableNumber: 'T5' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableNumber: 'T5',
          capacity: 4,
          status: TableStatus.AVAILABLE,
          qrCode: 'amber-table-t5-seed',
          floor: 1,
          section: 'Outdoor',
          isActive: true,
        },
        $setOnInsert: {
          qrToken: crypto.randomBytes(16).toString('hex'),
          qrGeneratedAt: new Date(),
          qrLastRegeneratedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    TableModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableNumber: 'B1' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableNumber: 'B1',
          capacity: 2,
          status: TableStatus.OCCUPIED,
          qrCode: 'amber-table-b1-seed',
          floor: 1,
          section: 'Bar',
          isActive: true,
        },
        $setOnInsert: {
          qrToken: crypto.randomBytes(16).toString('hex'),
          qrGeneratedAt: new Date(),
          qrLastRegeneratedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    TableModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableNumber: 'T6' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableNumber: 'T6',
          capacity: 4,
          status: TableStatus.AVAILABLE,
          qrCode: 'amber-table-t6-seed',
          floor: 2,
          section: 'Indoor',
          isActive: true,
        },
        $setOnInsert: {
          qrToken: crypto.randomBytes(16).toString('hex'),
          qrGeneratedAt: new Date(),
          qrLastRegeneratedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    TableModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableNumber: 'T7' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableNumber: 'T7',
          capacity: 6,
          status: TableStatus.AVAILABLE,
          qrCode: 'amber-table-t7-seed',
          floor: 2,
          section: 'Indoor',
          isActive: false, // Blocked
        },
        $setOnInsert: {
          qrToken: crypto.randomBytes(16).toString('hex'),
          qrGeneratedAt: new Date(),
          qrLastRegeneratedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
  ]);

  const activeSession = await TableSessionModel.findOneAndUpdate(
    { sessionToken: 'amber-table-session-seed' },
    {
      $set: {
        restaurantId: amberTable._id,
        tableId: tableTwo._id,
        customerName: customerUser.name,
        mobile: customerUser.mobile,
        sessionToken: 'amber-table-session-seed',
        sessionStart: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        lastActivityAt: new Date(),
        status: SessionStatus.ACTIVE,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).select('+sessionToken');

  tableTwo.currentSessionId = activeSession._id;
  await tableTwo.save();

  const [starterCategory, pizzaCategory, dessertCategory] = await Promise.all([
    Category.findOneAndUpdate(
      { restaurantId: amberTable._id, name: 'starter' },
      {
        $set: {
          restaurantId: amberTable._id,
          name: 'starter',
          description: 'Starters',
          displayOrder: 1,
          isActive: true,
          isHidden: false,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    Category.findOneAndUpdate(
      { restaurantId: amberTable._id, name: 'pizza' },
      {
        $set: {
          restaurantId: amberTable._id,
          name: 'pizza',
          description: 'Wood-fired pizzas',
          displayOrder: 2,
          isActive: true,
          isHidden: false,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    Category.findOneAndUpdate(
      { restaurantId: amberTable._id, name: 'dessert' },
      {
        $set: {
          restaurantId: amberTable._id,
          name: 'dessert',
          description: 'Desserts',
          displayOrder: 3,
          isActive: true,
          isHidden: false,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
  ]);

  const [broccoliItem, mushroomPizzaItem] = await Promise.all([
    MenuItem.findOneAndUpdate(
      { restaurantId: amberTable._id, name: 'Tandoori Broccoli' },
      {
        $set: {
          restaurantId: amberTable._id,
          categoryId: starterCategory._id,
          name: 'Tandoori Broccoli',
          description: 'Charred broccoli with hung curd glaze.',
          shortDescription: 'Smoky, creamy, vegetarian starter.',
          price: 320,
          isVeg: true,
          isAvailable: true,
          isHidden: false,
          spiceLevel: 1,
          preparationTime: 10,
          tags: ['starter', 'popular'],
          displayOrder: 1,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    MenuItem.findOneAndUpdate(
      { restaurantId: amberTable._id, name: 'Truffle Mushroom Pizza' },
      {
        $set: {
          restaurantId: amberTable._id,
          categoryId: pizzaCategory._id,
          name: 'Truffle Mushroom Pizza',
          description: 'Wood-fired pizza with truffle cream.',
          shortDescription: 'Rich mushroom pizza.',
          price: 640,
          isVeg: true,
          isAvailable: true,
          isHidden: false,
          spiceLevel: 0,
          preparationTime: 15,
          tags: ['pizza', 'recommended'],
          displayOrder: 1,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    MenuItem.findOneAndUpdate(
      { restaurantId: amberTable._id, name: 'Chicken Pepperoni Pizza' },
      {
        $set: {
          restaurantId: amberTable._id,
          categoryId: pizzaCategory._id,
          name: 'Chicken Pepperoni Pizza',
          description: 'Pepperoni pizza with smoked mozzarella.',
          shortDescription: 'Crowd-favorite non-veg pizza.',
          price: 720,
          isVeg: false,
          isAvailable: true,
          isHidden: false,
          spiceLevel: 3,
          preparationTime: 18,
          tags: ['pizza'],
          displayOrder: 2,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    MenuItem.findOneAndUpdate(
      { restaurantId: amberTable._id, name: 'Saffron Tres Leches' },
      {
        $set: {
          restaurantId: amberTable._id,
          categoryId: dessertCategory._id,
          name: 'Saffron Tres Leches',
          description: 'Soft cake soaked in saffron milk.',
          shortDescription: 'Signature dessert.',
          price: 280,
          isVeg: true,
          isAvailable: false,
          isHidden: false,
          spiceLevel: 0,
          preparationTime: 7,
          tags: ['dessert'],
          displayOrder: 1,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
  ]);

  const preparingOrder = await OrderModel.findOneAndUpdate(
    { orderNumber: 'ORD-SEED-1001' },
    {
      $set: {
        restaurantId: amberTable._id,
        tableId: tableTwo._id,
        sessionId: activeSession._id,
        orderNumber: 'ORD-SEED-1001',
        items: [buildOrderItem(mushroomPizzaItem, 1)],
        totalAmount: 640,
        taxAmount: 32,
        discountAmount: 0,
        finalAmount: 672,
        status: OrderDocumentStatus.PREPARING,
        paymentStatus: OrderPaymentStatus.PENDING,
        customerId: customerUser._id,
        estimatedPreparationTime: 14,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const readyOrder = await OrderModel.findOneAndUpdate(
    { orderNumber: 'ORD-SEED-1002' },
    {
      $set: {
        restaurantId: amberTable._id,
        tableId: tableTwo._id,
        sessionId: activeSession._id,
        orderNumber: 'ORD-SEED-1002',
        items: [buildOrderItem(broccoliItem, 1)],
        totalAmount: 320,
        taxAmount: 16,
        discountAmount: 0,
        finalAmount: 336,
        status: OrderDocumentStatus.READY,
        paymentStatus: OrderPaymentStatus.PENDING,
        customerId: customerUser._id,
        readyAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await Promise.all([
    ReservationModel.findOneAndUpdate(
      { restaurantId: amberTable._id, customerName: 'Ishita Shah', date: '2026-05-11', slot: '20:00' },
      {
        $set: {
          restaurantId: amberTable._id,
          customerName: 'Ishita Shah',
          mobile: '9876543210',
          guests: 4,
          date: '2026-05-11',
          slot: '20:00',
          status: ReservationStatus.CONFIRMED,
          tableId: tableOne._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    QueueEntryModel.findOneAndUpdate(
      { restaurantId: amberTable._id, customerName: 'Walk-in Singh', status: QueueStatus.WAITING },
      {
        $set: {
          restaurantId: amberTable._id,
          customerName: 'Walk-in Singh',
          guests: 3,
          priority: Priority.NORMAL,
          status: QueueStatus.WAITING,
          etaMinutes: 12,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    StaffRequestModel.findOneAndUpdate(
      { restaurantId: amberTable._id, sessionId: activeSession._id, type: RequestType.WAITER },
      {
        $set: {
          restaurantId: amberTable._id,
          sessionId: activeSession._id,
          tableId: tableTwo._id,
          type: RequestType.WAITER,
          status: RequestStatus.PENDING,
          priority: Priority.HIGH,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    StaffRequestModel.findOneAndUpdate(
      { restaurantId: amberTable._id, sessionId: activeSession._id, type: RequestType.WATER },
      {
        $set: {
          restaurantId: amberTable._id,
          sessionId: activeSession._id,
          tableId: tableTwo._id,
          type: RequestType.WATER,
          status: RequestStatus.ACCEPTED,
          priority: Priority.NORMAL,
          acceptedBy: staffUser._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    CleaningTaskModel.findOneAndUpdate(
      { restaurantId: amberTable._id, tableId: tableThree._id },
      {
        $set: {
          restaurantId: amberTable._id,
          tableId: tableThree._id,
          priority: Priority.HIGH,
          status: CleaningStatus.PENDING,
          verifiedBy: null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    OfferModel.findOneAndUpdate(
      { restaurantId: amberTable._id, code: 'LUNCH10' },
      {
        $set: {
          restaurantId: amberTable._id,
          name: 'Lunch Saver',
          code: 'LUNCH10',
          discountPercent: 10,
          active: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    NotificationModel.findOneAndUpdate(
      { restaurantId: amberTable._id, recipientRole: UserRole.RESTAURANT_ADMIN, title: 'Low stock alert' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableSessionId: null,
          recipientRole: UserRole.RESTAURANT_ADMIN,
          title: 'Low stock alert',
          message: 'Mozzarella below threshold.',
          type: 'LOW_STOCK_ALERT',
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.NORMAL,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          metadata: { sku: 'mozzarella', userId: adminUser._id },
          isRead: false,
          readAt: null,
          readBy: null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    NotificationModel.findOneAndUpdate(
      { restaurantId: amberTable._id, recipientRole: UserRole.SERVICE_STAFF, title: 'New waiter request' },
      {
        $set: {
          restaurantId: amberTable._id,
          tableSessionId: activeSession._id,
          recipientRole: UserRole.SERVICE_STAFF,
          title: 'New waiter request',
          message: 'Table T2 requested assistance.',
          type: 'REQUEST_WAITER',
          category: NotificationCategory.STAFF,
          priority: NotificationPriority.HIGH,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          metadata: { tableNumber: 'T2', userId: staffUser._id },
          isRead: false,
          readAt: null,
          readBy: null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    AuditLogModel.findOneAndUpdate(
      { action: 'APPROVE_RESTAURANT', entityId: String(amberTable._id) },
      {
        $set: {
          actorId: superAdminUser._id,
          action: 'APPROVE_RESTAURANT',
          entityId: String(amberTable._id),
          metadata: { restaurant: amberTable.name },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    AuditLogModel.findOneAndUpdate(
      { action: 'UPDATE_MENU', entityId: String(mushroomPizzaItem._id) },
      {
        $set: {
          actorId: adminUser._id,
          action: 'UPDATE_MENU',
          entityId: String(mushroomPizzaItem._id),
          metadata: { item: mushroomPizzaItem.name },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    KitchenBatchModel.findOneAndUpdate(
      { restaurantId: amberTable._id, name: 'Rush Batch A' },
      {
        $set: {
          restaurantId: amberTable._id,
          name: 'Rush Batch A',
          orderIds: [preparingOrder._id, readyOrder._id],
          status: BatchStatus.IN_PROGRESS,
          station: 'Hot Line',
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
    PaymentModel.findOneAndUpdate(
      { orderId: preparingOrder._id, method: 'UPI' },
      {
        $set: {
          restaurantId: amberTable._id,
          orderId: preparingOrder._id,
          sessionId: activeSession._id,
          amount: 672,
          method: 'UPI',
          status: PaymentStatus.PENDING,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
  ]);

  logger.info('Seeded local development data', {
    restaurantCount: await RestaurantModel.countDocuments(),
    userCount: await UserModel.countDocuments(),
  });
}
