import request from 'supertest';
import app from '../../app';
import { ErrorCode } from '../../constants/errors';
import { TableStatus } from '../../constants/statuses';
import { seedAnalyticsContext } from '../helpers/analytics.fixtures';

describe('Admin analytics routes', () => {
  it('returns revenue analytics with filters, grouped totals, and payment breakdown', async () => {
    const { adminToken } = await seedAnalyticsContext();

    const response = await request(app)
      .get('/api/v1/admin/analytics/revenue?from=2026-01-01&to=2026-01-31&groupBy=day')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.summary).toEqual({
      totalRevenue: 445,
      totalTax: 45,
      totalDiscount: 15,
      billCount: 3,
      averageBillValue: 148.33,
    });
    expect(response.body.data.filters).toEqual({
      from: '2026-01-01',
      to: '2026-01-31',
      groupBy: 'day',
    });
    expect(response.body.data.revenue).toEqual([
      {
        period: '2026-01-05',
        totalRevenue: 95,
        totalTax: 10,
        totalDiscount: 5,
        billCount: 1,
      },
      {
        period: '2026-01-12',
        totalRevenue: 350,
        totalTax: 35,
        totalDiscount: 10,
        billCount: 2,
      },
    ]);
    expect(response.body.data.paymentReport).toEqual([
      {
        paymentMethod: 'CARD',
        count: 1,
        totalAmount: 200,
      },
      {
        paymentMethod: 'CASH',
        count: 1,
        totalAmount: 150,
      },
      {
        paymentMethod: 'UPI',
        count: 1,
        totalAmount: 95,
      },
    ]);
  });

  it('returns peak hours analytics with busiest-hour summary', async () => {
    const { adminToken } = await seedAnalyticsContext();

    const response = await request(app)
      .get('/api/v1/admin/analytics/peak-hours?from=2026-01-01&to=2026-01-31')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.peakHours).toEqual([
      {
        hour: 12,
        hourLabel: '12:00',
        orderCount: 2,
        totalSales: 225,
      },
      {
        hour: 14,
        hourLabel: '14:00',
        orderCount: 1,
        totalSales: 200,
      },
      {
        hour: 18,
        hourLabel: '18:00',
        orderCount: 1,
        totalSales: 180,
      },
    ]);
    expect(response.body.data.summary).toEqual({
      busiestHour: 12,
      busiestHourLabel: '12:00',
      busiestHourOrderCount: 2,
      totalOrders: 4,
      totalSales: 605,
    });
  });

  it('returns repeat customer analytics with filtered repeat summary', async () => {
    const { adminToken } = await seedAnalyticsContext();

    const response = await request(app)
      .get('/api/v1/admin/analytics/repeat-customers?from=2026-01-01&to=2026-01-31')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.summary).toEqual({
      totalCustomers: 4,
      repeatCustomersCount: 3,
      repeatRatePercent: 75,
      activeCustomers: 3,
      activeRepeatCustomers: 2,
    });
    expect(response.body.data.repeatCustomers).toEqual([
      expect.objectContaining({
        name: 'Aarav',
        totalVisits: 5,
      }),
      expect.objectContaining({
        name: 'Sia',
        totalVisits: 2,
      }),
    ]);
  });

  it('returns kitchen analytics with staff-level and overall performance summaries', async () => {
    const { adminToken } = await seedAnalyticsContext();

    const response = await request(app)
      .get('/api/v1/admin/analytics/kitchen?from=2026-01-01&to=2026-01-31')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.summary).toEqual({
      totalKitchenStaff: 3,
      activeKitchenStaff: 2,
      ordersHandled: 4,
      avgPreparationTimeMinutes: 22.5,
      readyOrders: 3,
      rejectedOrders: 1,
      delayedOrders: 0,
    });
    expect(response.body.data.kitchenPerformance).toEqual([
      expect.objectContaining({
        name: 'Kitchen One',
        ordersHandled: 3,
        avgPreparationTimeMinutes: 21.67,
        readyOrders: 2,
        rejectedOrders: 1,
        totalSales: 405,
      }),
      expect.objectContaining({
        name: 'Kitchen Two',
        ordersHandled: 1,
        avgPreparationTimeMinutes: 25,
        readyOrders: 1,
        rejectedOrders: 0,
        totalSales: 200,
      }),
      expect.objectContaining({
        name: 'Kitchen Three',
        ordersHandled: 0,
        avgPreparationTimeMinutes: 0,
      }),
    ]);
  });

  it('returns table utilization analytics with summary and section breakdown', async () => {
    const { adminToken } = await seedAnalyticsContext();

    const response = await request(app)
      .get('/api/v1/admin/analytics/table-utilization')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.summary).toEqual({
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
    expect(response.body.data.tableUtilization).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tableNumber: 'A1',
          status: TableStatus.AVAILABLE,
          section: 'Main',
        }),
        expect.objectContaining({
          tableNumber: 'B1',
          status: TableStatus.OCCUPIED,
          section: 'VIP',
        }),
      ]),
    );
    expect(response.body.data.sectionBreakdown).toEqual([
      {
        floor: 1,
        section: 'Main',
        totalTables: 2,
        availableTables: 1,
        occupiedTables: 0,
        reservedTables: 1,
      },
      {
        floor: 1,
        section: 'VIP',
        totalTables: 1,
        availableTables: 0,
        occupiedTables: 1,
        reservedTables: 0,
      },
      {
        floor: 2,
        section: 'Patio',
        totalTables: 2,
        availableTables: 0,
        occupiedTables: 0,
        reservedTables: 0,
      },
      {
        floor: 2,
        section: 'VIP',
        totalTables: 1,
        availableTables: 0,
        occupiedTables: 0,
        reservedTables: 0,
      },
    ]);
  });

  it('returns customer retention analytics with summary and top customer list', async () => {
    const { adminToken } = await seedAnalyticsContext();

    const response = await request(app)
      .get('/api/v1/admin/analytics/customer-retention?from=2026-01-01&to=2026-01-31')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customerRetention.summary).toEqual({
      totalCustomers: 4,
      repeatCustomers: 3,
      activeCustomers: 3,
      repeatRatePercent: 75,
    });
    expect(response.body.data.customerRetention.filters).toEqual({
      from: '2026-01-01',
      to: '2026-01-31',
    });
    expect(response.body.data.customerRetention.customers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Aarav',
          totalVisits: 5,
        }),
        expect.objectContaining({
          name: 'Mira',
          totalVisits: 1,
        }),
      ]),
    );
  });

  it('keeps legacy overview and tables aliases working', async () => {
    const { adminToken } = await seedAnalyticsContext();

    const [overviewResponse, tablesResponse] = await Promise.all([
      request(app)
        .get('/api/v1/admin/analytics/overview?from=2026-01-01&to=2026-01-31')
        .set('Authorization', `Bearer ${adminToken}`),
      request(app)
        .get('/api/v1/admin/analytics/tables')
        .set('Authorization', `Bearer ${adminToken}`),
    ]);

    expect(overviewResponse.status).toBe(200);
    expect(overviewResponse.body.data.summary).toMatchObject({
      totalRevenue: 445,
      totalTax: 45,
      totalDiscount: 15,
      billCount: 3,
    });
    expect(overviewResponse.body.data.metrics).toEqual({
      totalCustomers: 4,
      repeatCustomersCount: 3,
      activeCustomers: 3,
      repeatRatePercent: 75,
    });

    expect(tablesResponse.status).toBe(200);
    expect(tablesResponse.body.data.tableUtilization).toHaveLength(6);
  });

  it('allows super-admin analytics access when restaurantId is provided', async () => {
    const { restaurantId, superAdminToken } = await seedAnalyticsContext();

    const response = await request(app)
      .get(`/api/v1/admin/analytics/revenue?restaurantId=${restaurantId}&groupBy=month`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.filters).toEqual({
      from: null,
      to: null,
      groupBy: 'month',
    });
    expect(response.body.data.revenue).toEqual([
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

  it('rejects invalid analytics filters and missing restaurant context', async () => {
    const { superAdminToken } = await seedAnalyticsContext();

    const [invalidRangeResponse, missingContextResponse, unauthorizedResponse] = await Promise.all([
      request(app)
        .get('/api/v1/admin/analytics/revenue?from=2026-02-01&to=2026-01-01')
        .set('Authorization', `Bearer ${superAdminToken}`),
      request(app)
        .get('/api/v1/admin/analytics/revenue')
        .set('Authorization', `Bearer ${superAdminToken}`),
      request(app).get('/api/v1/admin/analytics/revenue'),
    ]);

    expect(invalidRangeResponse.status).toBe(400);
    expect(invalidRangeResponse.body.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(invalidRangeResponse.body.error.fields.from).toContain('From date must be before or equal to to date');

    expect(missingContextResponse.status).toBe(403);
    expect(missingContextResponse.body.error.code).toBe(ErrorCode.FORBIDDEN);
    expect(missingContextResponse.body.error.message).toBe('Restaurant context required');

    expect(unauthorizedResponse.status).toBe(401);
    expect(unauthorizedResponse.body.error.code).toBe(ErrorCode.UNAUTHORIZED);
  });
});
