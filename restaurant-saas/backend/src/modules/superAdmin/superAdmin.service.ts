// src/modules/superAdmin/superAdmin.service.ts
// All DB logic for super admin operations.
// Controllers stay thin — everything lives here.

import mongoose, { FilterQuery } from 'mongoose';
import { RestaurantModel } from '../restaurants/restaurants.model';
import { UserModel } from '../users/users.model';
import { PlatformPlanModel, FeatureFlagModel } from './superAdmin.model';
import { AuditLogModel } from '../auditLogs/auditLogs.schema';
import { TableSessionModel } from '../tableSessions/tableSessions.model';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { RestaurantStatus } from '../../constants/statuses';
import type {
  RestaurantListQuery,
  CreatePlanInput,
  UpdatePlanInput,
  UpdateFeatureFlagInput,
  AnalyticsQuery,
  SuperAdminAuditLogQuery,
} from './superAdmin.schema';

// ── Helpers ───────────────────────────────────────────────────────────

function getDateRange(groupBy: string, from?: string, to?: string) {
  const now = new Date();
  let start: Date;
  const end = to ? new Date(to) : now;

  if (from) {
    start = new Date(from);
  } else {
    // Default ranges when no from/to provided
    switch (groupBy) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        break;
      default: // day
        start = new Date(now);
        start.setDate(now.getDate() - 1);
        break;
    }
  }

  return { start, end };
}

function getGroupByFormat(groupBy: string) {
  switch (groupBy) {
    case 'week':
      return { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    case 'month':
      return { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    case 'year':
      return { year: { $year: '$createdAt' } };
    default: // day
      return {
        year:  { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day:   { $dayOfMonth: '$createdAt' },
      };
  }
}

// ──────────────────────────────────────────────────────────────────────
// RESTAURANT MANAGEMENT
// ──────────────────────────────────────────────────────────────────────

export async function listRestaurants(filters: RestaurantListQuery) {
  const { status, plan, search, page = 1, limit = 20 } = filters;

  const query: FilterQuery<typeof RestaurantModel> = {};

  if (status) query.status = status;
  if (plan)   query.plan   = plan;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [restaurants, total] = await Promise.all([
    RestaurantModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    RestaurantModel.countDocuments(query),
  ]);

  return {
    restaurants,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRestaurantById(id: string) {
  const restaurant = await RestaurantModel.findById(id).lean();

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404, ErrorCode.NOT_FOUND);
  }

  return restaurant;
}

export async function approveRestaurant(id: string) {
  const restaurant = await RestaurantModel.findByIdAndUpdate(
    id,
    { status: RestaurantStatus.ACTIVE },
    { new: true },
  ).lean();

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404, ErrorCode.NOT_FOUND);
  }

  return restaurant;
}

export async function suspendRestaurant(id: string) {
  const restaurant = await RestaurantModel.findByIdAndUpdate(
    id,
    { status: RestaurantStatus.SUSPENDED },
    { new: true },
  ).lean();

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404, ErrorCode.NOT_FOUND);
  }

  return restaurant;
}

export async function deleteRestaurant(id: string) {
  const restaurant = await RestaurantModel.findByIdAndDelete(id).lean();

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404, ErrorCode.NOT_FOUND);
  }

  return restaurant;
}

// ──────────────────────────────────────────────────────────────────────
// PLANS
// ──────────────────────────────────────────────────────────────────────

export async function createPlan(input: CreatePlanInput) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existing = await PlatformPlanModel.findOne({ name: input.name }).session(session);
    if (existing) {
      throw new AppError('Plan with this name already exists', 409, ErrorCode.CONFLICT);
    }

    const created = await PlatformPlanModel.create([input], { session });
    await session.commitTransaction();
    return created[0];
  } catch (error) {
    await session.abortTransaction();
    const anyErr = error as any;
    if (anyErr?.code === 11000) {
      throw new AppError('Plan with this name already exists', 409, ErrorCode.CONFLICT);
    }
    throw error;
  } finally {
    session.endSession();
  }
}

export async function listPlans() {
  return PlatformPlanModel.find().sort({ priceMonthly: 1 }).lean();
}

export async function updatePlan(id: string, input: UpdatePlanInput) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const plan = await PlatformPlanModel.findByIdAndUpdate(
      id,
      input,
      { new: true, runValidators: true, session },
    ).lean();

    if (!plan) {
      throw new AppError('Plan not found', 404, ErrorCode.NOT_FOUND);
    }

    await session.commitTransaction();
    return plan;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// ──────────────────────────────────────────────────────────────────────
// FEATURE FLAGS
// ──────────────────────────────────────────────────────────────────────

export async function listFeatureFlags() {
  return FeatureFlagModel.find().sort({ key: 1 }).lean();
}

export async function updateFeatureFlag(id: string, input: UpdateFeatureFlagInput) {
  const flag = await FeatureFlagModel.findByIdAndUpdate(
    id,
    { enabled: input.enabled },
    { new: true },
  ).lean();

  if (!flag) {
    throw new AppError('Feature flag not found', 404, ErrorCode.NOT_FOUND);
  }

  return flag;
}

// ──────────────────────────────────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────────────────────────────────

export async function getPlatformOverview() {
  const [
    totalRestaurants,
    activeRestaurants,
    totalUsers,
    activeSessions,
  ] = await Promise.all([
    RestaurantModel.countDocuments(),
    RestaurantModel.countDocuments({ status: RestaurantStatus.ACTIVE }),
    UserModel.countDocuments(),
    TableSessionModel.countDocuments({ status: 'ACTIVE' }),
  ]);

  return {
    totalRestaurants,
    activeRestaurants,
    suspendedRestaurants: totalRestaurants - activeRestaurants,
    totalUsers,
    activeSessions,
  };
}

export async function getRevenueAnalytics(query: AnalyticsQuery) {
  const { groupBy = 'day', from, to } = query;
  const { start, end } = getDateRange(groupBy, from, to);
  const groupFormat = getGroupByFormat(groupBy);

  // Import OrderModel here to avoid circular deps
  const { OrderModel } = await import('../orders/orders.model');

  const revenue = await OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: ['COMPLETED', 'SERVED'] },
      },
    },
    {
      $group: {
        _id:          groupFormat,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders:  { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  return {
    groupBy,
    from: start.toISOString(),
    to:   end.toISOString(),
    data: revenue,
  };
}

export async function getActiveTenantAnalytics(query: AnalyticsQuery) {
  const { groupBy = 'day', from, to } = query;
  const { start, end } = getDateRange(groupBy, from, to);
  const groupFormat = getGroupByFormat(groupBy);

  const tenants = await RestaurantModel.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id:   groupFormat,
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  return {
    groupBy,
    from: start.toISOString(),
    to:   end.toISOString(),
    data: tenants,
  };
}

export async function getSystemMonitoring() {
  const [
    totalRestaurants,
    totalUsers,
    activeSessions,
    totalAuditLogs,
  ] = await Promise.all([
    RestaurantModel.countDocuments(),
    UserModel.countDocuments(),
    TableSessionModel.countDocuments({ status: 'ACTIVE' }),
    AuditLogModel.countDocuments(),
  ]);

  return {
    totalRestaurants,
    totalUsers,
    activeSessions,
    totalAuditLogs,
    timestamp: new Date().toISOString(),
  };
}

// ──────────────────────────────────────────────────────────────────────
// AUDIT LOGS (platform-wide — no restaurant scope)
// ──────────────────────────────────────────────────────────────────────

export async function getPlatformAuditLogs(filters: SuperAdminAuditLogQuery) {
  const { actorId, action, from, to, page = 1, limit = 20 } = filters;

  const query: FilterQuery<typeof AuditLogModel> = {};

  if (actorId) query.actorId = actorId;
  if (action)  query.action  = action;

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to)   query.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLogModel.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}