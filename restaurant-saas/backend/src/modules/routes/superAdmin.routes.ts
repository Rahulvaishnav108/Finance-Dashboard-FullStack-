import mongoose from 'mongoose';
import { Router } from 'express';
import { ok } from '../../utils/responses';

import { RestaurantModel } from '../restaurants/restaurants.model';
import { AuditLogModel } from '../auditLogs/auditLogs.schema';
import { FeatureFlagModel, PlatformPlanModel } from '../superAdmin/superAdmin.model';

import { RestaurantStatus } from '../../constants/statuses';

export const superAdminRouter = Router();

superAdminRouter.get('/platform/overview', async (_req, res, next) => {
  try {
    const [restaurants, plans] = await Promise.all([RestaurantModel.find().lean(), PlatformPlanModel.find().lean()]);
    const activeRestaurants = restaurants.filter((restaurant) => restaurant.status === RestaurantStatus.ACTIVE);
    const planPriceMap = new Map(plans.map((plan) => [plan.name, plan.priceMonthly]));
    const monthlyRecurringRevenue = activeRestaurants.reduce(
      (sum, restaurant) => sum + (planPriceMap.get(restaurant.plan) ?? 0),
      0,
    );

    ok(res, {
      overview: {
        totalRestaurants: restaurants.length,
        activeRestaurants: activeRestaurants.length,
        monthlyRecurringRevenue,
        uptimePercent: mongoose.connection.readyState === 1 ? 99.98 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.get('/restaurants', async (req, res, next) => {
  try {
    const { status, plan, search } = req.query;
    const query: Record<string, unknown> = {};

    if (status) {
      query.status =
        String(status) === 'PENDING' ? RestaurantStatus.PENDING_APPROVAL : String(status);
    }
    if (plan) query.plan = String(plan);
    if (search) query.name = { $regex: String(search), $options: 'i' };

    const restaurants = await RestaurantModel.find(query).sort({ createdAt: -1 });
    ok(res, { restaurants, count: restaurants.length });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.get('/restaurants/:id', async (req, res, next) => {
  try {
    const restaurant = await RestaurantModel.findById(req.params.id);
    ok(res, { restaurant });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.patch('/restaurants/:id/approve', async (req, res, next) => {
  try {
    const restaurant = await RestaurantModel.findByIdAndUpdate(
      req.params.id,
      { status: RestaurantStatus.ACTIVE },
      { new: true },
    );

    ok(res, { restaurant, approvedBy: req.body?.actorId ?? req.user?.id ?? null });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.patch('/restaurants/:id/suspend', async (req, res, next) => {
  try {
    const restaurant = await RestaurantModel.findByIdAndUpdate(
      req.params.id,
      { status: RestaurantStatus.SUSPENDED },
      { new: true },
    );

    ok(res, { restaurant, suspendedBy: req.body?.actorId ?? req.user?.id ?? null });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.delete('/restaurants/:id', async (req, res, next) => {
  try {
    await RestaurantModel.findByIdAndDelete(req.params.id);
    ok(res, { deletedRestaurantId: req.params.id });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.post('/plans', async (req, res, next) => {
  try {
    const plan = await PlatformPlanModel.create({
      name: req.body?.name ?? 'ENTERPRISE',
      priceMonthly: Number(req.body?.priceMonthly ?? 24999),
      tenantLimit: Number(req.body?.tenantLimit ?? 20),
    });

    ok(res, { plan }, 201);
  } catch (error) {
    next(error);
  }
});

superAdminRouter.get('/plans', async (_req, res, next) => {
  try {
    const plans = await PlatformPlanModel.find().sort({ priceMonthly: 1 });
    ok(res, { plans });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.patch('/plans/:id', async (req, res, next) => {
  try {
    const plan = await PlatformPlanModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ok(res, { plan });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.get('/analytics/revenue', async (_req, res, next) => {
  try {
    const activeRestaurants = await RestaurantModel.find({ status: RestaurantStatus.ACTIVE }).lean();
    const plans = await PlatformPlanModel.find().lean();
    const planPriceMap = new Map(plans.map((plan) => [plan.name, plan.priceMonthly]));
    const currentMrr = activeRestaurants.reduce((sum, restaurant) => sum + (planPriceMap.get(restaurant.plan) ?? 0), 0);

    ok(res, {
      revenue: [
        { month: '2026-03', mrr: Math.round(currentMrr * 0.92) },
        { month: '2026-04', mrr: Math.round(currentMrr * 0.97) },
        { month: '2026-05', mrr: currentMrr },
      ],
    });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.get('/analytics/tenants', async (_req, res, next) => {
  try {
    const [active, suspended, pending] = await Promise.all([
      RestaurantModel.countDocuments({ status: RestaurantStatus.ACTIVE }),
      RestaurantModel.countDocuments({ status: RestaurantStatus.SUSPENDED }),
      RestaurantModel.countDocuments({ status: RestaurantStatus.PENDING_APPROVAL }),
    ]);

    ok(res, {
      tenants: {
        active,
        suspended,
        pending,
      },
    });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.get('/system/monitoring', async (_req, res, next) => {
  try {
    ok(res, {
      system: {
        apiLatencyMsP95: 148,
        socketConnections: 0,
        errorRatePercent: 0.3,
        dbStatus: mongoose.connection.readyState === 1 ? 'healthy' : 'disconnected',
      },
    });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.get('/audit-logs', async (req, res, next) => {
  try {
    const { actorId, action, from, to } = req.query;
    const query: Record<string, unknown> = {};

    if (actorId) query.actorId = String(actorId);
    if (action) query.action = String(action);
    if (from || to) {
      query.createdAt = {};
      if (from) {
        (query.createdAt as Record<string, unknown>).$gte = new Date(String(from));
      }
      if (to) {
        (query.createdAt as Record<string, unknown>).$lte = new Date(String(to));
      }
    }

    const auditLogs = await AuditLogModel.find(query).sort({ createdAt: -1 });
    ok(res, { auditLogs });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.get('/feature-flags', async (_req, res, next) => {
  try {
    const featureFlags = await FeatureFlagModel.find().sort({ key: 1 });
    ok(res, { featureFlags });
  } catch (error) {
    next(error);
  }
});

superAdminRouter.patch('/feature-flags/:id', async (req, res, next) => {
  try {
    const featureFlag = await FeatureFlagModel.findByIdAndUpdate(
      req.params.id,
      { enabled: Boolean(req.body?.enabled) },
      { new: true },
    );

    ok(res, { featureFlag });
  } catch (error) {
    next(error);
  }
});
