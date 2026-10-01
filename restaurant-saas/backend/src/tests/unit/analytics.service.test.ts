import { UserRole } from '../../constants/roles';
import mongoose from 'mongoose';
import { OrderStatus, Priority } from '../../constants/statuses';
import { AnalyticsService } from '../../modules/analytics/analytics.service';
import { OrderModel } from '../../modules/orders/orders.model';
import { PaymentStatus as OrderPaymentStatus } from '../../modules/orders/orders.schema';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { UserModel } from '../../modules/users/users.model';
import { seedAnalyticsContext } from '../helpers/analytics.fixtures';

jest.mock('../../modules/subscriptions/subscriptionEnforcement.service', () => ({
  assertFeatureAccess: jest.fn().mockResolvedValue(undefined),
  assertPlanLimit: jest.fn().mockResolvedValue(undefined),
  recordSubscriptionUsage: jest.fn().mockResolvedValue(undefined),
}));

function createOrderItem(name: string, price: number) {
  return {
    menuItemId: new mongoose.Types.ObjectId(),
    name,
    quantity: 1,
    price,
    totalPrice: price,
  };
}

describe('analytics service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds overview and revenue summaries from paid billing data only', async () => {
    const { restaurantId } = await seedAnalyticsContext();

    const [overview, revenue] = await Promise.all([
      AnalyticsService.getAdminOverview(restaurantId, {
        from: '2026-01-01',
        to: '2026-01-31',
      }),
      AnalyticsService.getRevenueAnalytics(restaurantId, {
        groupBy: 'month',
      }),
    ]);

    expect(overview.summary).toEqual({
      totalRevenue: 445,
      totalTax: 45,
      totalDiscount: 15,
      billCount: 3,
      averageBillValue: 148.33,
    });
    expect(overview.metrics).toEqual({
      totalCustomers: 4,
      repeatCustomersCount: 3,
      activeCustomers: 3,
      repeatRatePercent: 75,
    });
    expect(revenue.revenue).toEqual([
      {
        period: '2026-01',
        totalRevenue: 445,
        totalTax: 45,
        totalDiscount: 15,
        billCount: 3,
      },
      {
        period: '2026-02',
        totalRevenue: 150,
        totalTax: 10,
        totalDiscount: 0,
        billCount: 1,
      },
    ]);
  });

  it('computes peak hour and kitchen summaries with date filtering', async () => {
    const { restaurantId } = await seedAnalyticsContext();

    const filters = {
      from: '2026-01-01',
      to: '2026-01-31',
    };

    const [peakHours, kitchen] = await Promise.all([
      AnalyticsService.getPeakHours(restaurantId, filters),
      AnalyticsService.getKitchenPerformance(restaurantId, filters),
    ]);

    expect(peakHours.summary).toEqual({
      busiestHour: 12,
      busiestHourLabel: '12:00',
      busiestHourOrderCount: 2,
      totalOrders: 4,
      totalSales: 605,
    });
    expect(kitchen.summary).toEqual({
      totalKitchenStaff: 3,
      activeKitchenStaff: 2,
      ordersHandled: 4,
      avgPreparationTimeMinutes: 22.5,
      readyOrders: 3,
      rejectedOrders: 1,
      delayedOrders: 0,
    });
    expect(kitchen.kitchenPerformance[0]).toMatchObject({
      name: 'Kitchen One',
      ordersHandled: 3,
      avgPreparationTimeMinutes: 21.67,
    });
  });

  it('returns table utilization and customer retention summaries aligned to seeded restaurant data', async () => {
    const { restaurantId } = await seedAnalyticsContext();

    const [tables, retention, repeatCustomers] = await Promise.all([
      AnalyticsService.getTableUtilization(restaurantId, {}),
      AnalyticsService.getCustomerRetention(restaurantId, {
        from: '2026-01-01',
        to: '2026-01-31',
      }),
      AnalyticsService.getRepeatCustomers(restaurantId, {
        from: '2026-01-01',
        to: '2026-01-31',
      }),
    ]);

    expect(tables.summary).toEqual({
      totalTables: 6,
      activeTables: 6,
      availableTables: 1,
      reservedTables: 1,
      occupiedTables: 1,
      paymentPendingTables: 1,
      needsCleaningTables: 1,
      cleaningInProgressTables: 1,
      totalCapacity: 22,
      occupancyRatePercent: 16.67,
    });
    expect(retention.summary).toEqual({
      totalCustomers: 4,
      repeatCustomers: 3,
      activeCustomers: 3,
      repeatRatePercent: 75,
    });
    expect(repeatCustomers.summary).toEqual({
      totalCustomers: 4,
      repeatCustomersCount: 3,
      activeCustomers: 3,
      activeRepeatCustomers: 2,
      repeatRatePercent: 75,
    });
  });

  it('supports ISO datetime filters, no-filter overviews, and delayed kitchen counts', async () => {
    const { restaurantId } = await seedAnalyticsContext();

    const [overview, revenue, kitchen] = await Promise.all([
      AnalyticsService.getAdminOverview(restaurantId, {}),
      AnalyticsService.getRevenueAnalytics(restaurantId, {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T23:59:59.999Z',
        groupBy: 'day',
      }),
      AnalyticsService.getKitchenPerformance(restaurantId, {}),
    ]);

    expect(overview.summary).toEqual({
      totalRevenue: 595,
      totalTax: 55,
      totalDiscount: 15,
      billCount: 4,
      averageBillValue: 148.75,
    });
    expect(overview.metrics).toEqual({
      totalCustomers: 4,
      repeatCustomersCount: 3,
      activeCustomers: 4,
      repeatRatePercent: 75,
    });
    expect(revenue.summary).toEqual({
      totalRevenue: 445,
      totalTax: 45,
      totalDiscount: 15,
      billCount: 3,
      averageBillValue: 148.33,
    });
    expect(kitchen.summary).toEqual({
      totalKitchenStaff: 3,
      activeKitchenStaff: 2,
      ordersHandled: 5,
      avgPreparationTimeMinutes: 22.5,
      readyOrders: 3,
      rejectedOrders: 1,
      delayedOrders: 1,
    });
  });

  it('excludes restaurant admins that never handled kitchen work from kitchen performance totals', async () => {
    const { restaurantId } = await seedAnalyticsContext();

    await UserModel.create({
      name: 'Restaurant Admin Observer',
      email: 'observer.admin@example.com',
      mobile: '9999988888',
      role: UserRole.RESTAURANT_ADMIN,
      status: 'ACTIVE',
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    });

    const kitchen = await AnalyticsService.getKitchenPerformance(restaurantId, {
      from: '2026-01-01',
      to: '2026-01-31',
    });

    expect(kitchen.summary.totalKitchenStaff).toBe(3);
    expect(kitchen.kitchenPerformance.map((staff) => staff.name)).not.toContain('Restaurant Admin Observer');
  });

  it('breaks peak-hour ties by sales and then by higher order volume', async () => {
    const restaurant = await RestaurantModel.create({
      slug: 'analytics-tie-breakers',
      name: 'Analytics Tie Breakers',
      plan: 'BASIC',
      cuisine: 'Cafe',
      city: 'Jaipur',
    });

    await OrderModel.create([
      {
        restaurantId: restaurant._id,
        orderNumber: 'TIE-001',
        items: [createOrderItem('Coffee', 100)],
        totalAmount: 100,
        taxAmount: 0,
        discountAmount: 0,
        finalAmount: 100,
        status: OrderStatus.READY,
        priority: Priority.NORMAL,
        paymentStatus: OrderPaymentStatus.PAID,
        createdAt: new Date('2026-03-01T12:00:00.000Z'),
        updatedAt: new Date('2026-03-01T12:20:00.000Z'),
      },
      {
        restaurantId: restaurant._id,
        orderNumber: 'TIE-002',
        items: [createOrderItem('Pizza Slice', 150)],
        totalAmount: 150,
        taxAmount: 0,
        discountAmount: 0,
        finalAmount: 150,
        status: OrderStatus.READY,
        priority: Priority.NORMAL,
        paymentStatus: OrderPaymentStatus.PAID,
        createdAt: new Date('2026-03-01T13:00:00.000Z'),
        updatedAt: new Date('2026-03-01T13:20:00.000Z'),
      },
      {
        restaurantId: restaurant._id,
        orderNumber: 'TIE-003',
        items: [createOrderItem('Soup', 30)],
        totalAmount: 30,
        taxAmount: 0,
        discountAmount: 0,
        finalAmount: 30,
        status: OrderStatus.READY,
        priority: Priority.NORMAL,
        paymentStatus: OrderPaymentStatus.PAID,
        createdAt: new Date('2026-03-01T19:00:00.000Z'),
        updatedAt: new Date('2026-03-01T19:15:00.000Z'),
      },
      {
        restaurantId: restaurant._id,
        orderNumber: 'TIE-004',
        items: [createOrderItem('Pasta', 40)],
        totalAmount: 40,
        taxAmount: 0,
        discountAmount: 0,
        finalAmount: 40,
        status: OrderStatus.READY,
        priority: Priority.NORMAL,
        paymentStatus: OrderPaymentStatus.PAID,
        createdAt: new Date('2026-03-01T19:10:00.000Z'),
        updatedAt: new Date('2026-03-01T19:25:00.000Z'),
      },
      {
        restaurantId: restaurant._id,
        orderNumber: 'TIE-005',
        items: [createOrderItem('Salad', 50)],
        totalAmount: 50,
        taxAmount: 0,
        discountAmount: 0,
        finalAmount: 50,
        status: OrderStatus.READY,
        priority: Priority.NORMAL,
        paymentStatus: OrderPaymentStatus.PAID,
        createdAt: new Date('2026-03-01T19:20:00.000Z'),
        updatedAt: new Date('2026-03-01T19:35:00.000Z'),
      },
    ]);

    const peakHours = await AnalyticsService.getPeakHours(restaurant.id, {});

    expect(peakHours.peakHours).toEqual([
      {
        hour: 12,
        hourLabel: '12:00',
        orderCount: 1,
        totalSales: 100,
      },
      {
        hour: 13,
        hourLabel: '13:00',
        orderCount: 1,
        totalSales: 150,
      },
      {
        hour: 19,
        hourLabel: '19:00',
        orderCount: 3,
        totalSales: 120,
      },
    ]);
    expect(peakHours.summary).toEqual({
      busiestHour: 19,
      busiestHourLabel: '19:00',
      busiestHourOrderCount: 3,
      totalOrders: 5,
      totalSales: 370,
    });
  });

  it('defensively ignores malformed handled orders without kitchenStaffId', async () => {
    jest.spyOn(UserModel, 'find').mockReturnValue({
      select: () => ({
        lean: async () => [],
      }),
    } as never);
    jest.spyOn(OrderModel, 'find').mockReturnValue({
      select: () => ({
        lean: async () => [
          {
            status: OrderStatus.READY,
            finalAmount: 50,
            acceptedAt: new Date('2026-03-01T12:00:00.000Z'),
            readyAt: new Date('2026-03-01T12:20:00.000Z'),
          },
        ],
      }),
    } as never);

    const result = await AnalyticsService.getKitchenPerformance('507f1f77bcf86cd799439011', {});

    expect(result).toEqual({
      kitchenPerformance: [],
      summary: {
        totalKitchenStaff: 0,
        activeKitchenStaff: 0,
        ordersHandled: 0,
        avgPreparationTimeMinutes: 0,
        readyOrders: 0,
        rejectedOrders: 0,
        delayedOrders: 0,
      },
      filters: {
        from: null,
        to: null,
      },
    });
  });
});
