import type { NextFunction, Request, Response } from 'express';
import { ok } from '../../utils/responses';
import { AnalyticsService } from './analytics.service';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import type { AnalyticsQueryInput } from './analytics.schema';
import mongoose from 'mongoose';

function getRestaurantId(req: Request): string {
  const restaurantId = req.user?.restaurantId || req.query.restaurantId;
  if (!restaurantId || typeof restaurantId !== 'string') {
    throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
  }
  return restaurantId;
}

export async function getOverviewAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const query = req.query as unknown as AnalyticsQueryInput;
    const data = await AnalyticsService.getAdminOverview(restaurantId, query);
    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getRevenueAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const query = req.query as unknown as AnalyticsQueryInput;
    const data = await AnalyticsService.getRevenueAnalytics(restaurantId, query);
    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getPeakHoursAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const query = req.query as unknown as AnalyticsQueryInput;
    const data = await AnalyticsService.getPeakHours(restaurantId, query);
    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getRepeatCustomersAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const query = req.query as unknown as AnalyticsQueryInput;
    const data = await AnalyticsService.getRepeatCustomers(restaurantId, query);
    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getKitchenPerformanceAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const query = req.query as unknown as AnalyticsQueryInput;
    const data = await AnalyticsService.getKitchenPerformance(restaurantId, query);
    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getTableUtilizationAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const query = req.query as unknown as AnalyticsQueryInput;
    const data = await AnalyticsService.getTableUtilization(restaurantId, query);
    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getCustomerRetentionAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const query = req.query as unknown as AnalyticsQueryInput;
    const data = await AnalyticsService.getCustomerRetention(restaurantId, query);
    ok(res, { customerRetention: data });
  } catch (error) {
    next(error);
  }
}

export async function getSubscriptionUsageAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const data = await AnalyticsService.getSubscriptionUsageAnalytics(restaurantId);
    ok(res, { subscriptionUsageAnalytics: data });
  } catch (error) {
    next(error);
  }
}

import logger from '../../config/logger';

export async function getInventoryAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);
    const query = req.query as unknown as AnalyticsQueryInput;
    logger.info('[DEBUG] getInventoryAnalytics req.query', { query });
    const data = await AnalyticsService.getInventoryAnalytics(restaurantId, query);
    logger.info('[DEBUG] getInventoryAnalytics data', { data });
    ok(res, { inventoryAnalytics: data });
  } catch (error) {
    logger.error('[DEBUG] getInventoryAnalytics ERROR', { error });
    next(error);
  }
}

import { BillingModel } from '../billing/billing.model';

export async function getReceiptAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = getRestaurantId(req);

    // Using aggregation to count all non-null fields
    const stats = await BillingModel.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      { $group: {
          _id: null,
          viewedReceipts: { $sum: { $cond: [{ $ne: ['$receiptViewedAt', null] }, 1, 0] } },
          downloadedReceipts: { $sum: { $cond: [{ $ne: ['$receiptDownloadedAt', null] }, 1, 0] } },
          sharedReceipts: { $sum: { $cond: [{ $ne: ['$receiptSharedAt', null] }, 1, 0] } },
          emailedReceipts: { $sum: { $cond: [{ $ne: ['$receiptEmailedAt', null] }, 1, 0] } },
          totalReceiptsRequested: { $sum: { $cond: ['$wantsReceipt', 1, 0] } },
          totalBills: { $sum: 1 }
      }}
    ]);

    const result = stats[0] || {
      viewedReceipts: 0,
      downloadedReceipts: 0,
      sharedReceipts: 0,
      emailedReceipts: 0,
      totalReceiptsRequested: 0,
      totalBills: 0
    };

    const emailReceiptRate = result.totalBills > 0 ? (result.emailedReceipts / result.totalBills) * 100 : 0;

    ok(res, {
      ...result,
      emailReceiptRate: Math.round(emailReceiptRate * 100) / 100
    });
  } catch (error) {
    next(error);
  }
}