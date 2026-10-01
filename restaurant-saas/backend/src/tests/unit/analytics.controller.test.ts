import type { Request, Response } from 'express';
import {
  getCustomerRetentionAnalytics,
  getKitchenPerformanceAnalytics,
  getOverviewAnalytics,
  getPeakHoursAnalytics,
  getRepeatCustomersAnalytics,
  getRevenueAnalytics,
  getTableUtilizationAnalytics,
} from '../../modules/analytics/analytics.controller';
import { AnalyticsService } from '../../modules/analytics/analytics.service';

function createResponseMock(): Response {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  return response as unknown as Response;
}

describe('analytics controller', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns customer retention data with the expected wrapper shape', async () => {
    const req = {
      user: { restaurantId: '507f1f77bcf86cd799439011' },
      query: { from: '2026-01-01', to: '2026-01-31' },
    } as unknown as Request;
    const res = createResponseMock();
    const next = jest.fn();

    jest.spyOn(AnalyticsService, 'getCustomerRetention').mockResolvedValue({
      summary: {
        totalCustomers: 4,
        repeatCustomers: 3,
        activeCustomers: 3,
        repeatRatePercent: 75,
      },
      customers: [],
      filters: {
        from: '2026-01-01',
        to: '2026-01-31',
      },
    });

    await getCustomerRetentionAnalytics(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        customerRetention: {
          summary: {
            totalCustomers: 4,
            repeatCustomers: 3,
            activeCustomers: 3,
            repeatRatePercent: 75,
          },
          customers: [],
          filters: {
            from: '2026-01-01',
            to: '2026-01-31',
          },
        },
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    ['overview', getOverviewAnalytics],
    ['revenue', getRevenueAnalytics],
    ['peak hours', getPeakHoursAnalytics],
    ['repeat customers', getRepeatCustomersAnalytics],
    ['kitchen performance', getKitchenPerformanceAnalytics],
    ['table utilization', getTableUtilizationAnalytics],
    ['customer retention', getCustomerRetentionAnalytics],
  ])('passes %s controller errors to next when restaurant context is missing', async (_label, handler) => {
    const req = { query: {} } as unknown as Request;
    const res = createResponseMock();
    const next = jest.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
