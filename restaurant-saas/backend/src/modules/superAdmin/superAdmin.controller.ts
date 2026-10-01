// src/modules/superAdmin/superAdmin.controller.ts

import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../utils/responses';
import * as superAdminService from './superAdmin.service';
import type {
  RestaurantListQuery,
  AnalyticsQuery,
  SuperAdminAuditLogQuery,
} from './superAdmin.schema';

// ──────────────────────────────────────────────────────────────────────
// PLATFORM OVERVIEW
// ──────────────────────────────────────────────────────────────────────

export const getPlatformOverview = asyncHandler(async (req: Request, res: Response) => {
  const result = await superAdminService.getPlatformOverview();
  ok(res, result);
});

// ──────────────────────────────────────────────────────────────────────
// RESTAURANT MANAGEMENT
// ──────────────────────────────────────────────────────────────────────

export const listRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as RestaurantListQuery;
  const result = await superAdminService.listRestaurants(query);
  ok(res, result);
});

export const getRestaurantById = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await superAdminService.getRestaurantById(req.params.id);
  ok(res, { restaurant });
});

export const approveRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await superAdminService.approveRestaurant(req.params.id);
  ok(res, { restaurant });
});

export const suspendRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await superAdminService.suspendRestaurant(req.params.id);
  ok(res, { restaurant });
});

export const deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
  await superAdminService.deleteRestaurant(req.params.id);
  ok(res, { message: 'Restaurant deleted successfully' });
});

// ──────────────────────────────────────────────────────────────────────
// PLANS
// ──────────────────────────────────────────────────────────────────────

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await superAdminService.createPlan(req.body);
  ok(res, { plan }, 201);
});

export const listPlans = asyncHandler(async (req: Request, res: Response) => {
  const plans = await superAdminService.listPlans();
  ok(res, { plans });
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await superAdminService.updatePlan(req.params.id, req.body);
  ok(res, { plan });
});

// ──────────────────────────────────────────────────────────────────────
// FEATURE FLAGS
// ──────────────────────────────────────────────────────────────────────

export const listFeatureFlags = asyncHandler(async (req: Request, res: Response) => {
  const flags = await superAdminService.listFeatureFlags();
  ok(res, { flags });
});

export const updateFeatureFlag = asyncHandler(async (req: Request, res: Response) => {
  const flag = await superAdminService.updateFeatureFlag(req.params.id, req.body);
  ok(res, { flag });
});

// ──────────────────────────────────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────────────────────────────────

export const getRevenueAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AnalyticsQuery;
  const result = await superAdminService.getRevenueAnalytics(query);
  ok(res, result);
});

export const getActiveTenantAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AnalyticsQuery;
  const result = await superAdminService.getActiveTenantAnalytics(query);
  ok(res, result);
});

export const getSystemMonitoring = asyncHandler(async (req: Request, res: Response) => {
  const result = await superAdminService.getSystemMonitoring();
  ok(res, result);
});

// ──────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ──────────────────────────────────────────────────────────────────────

export const getPlatformAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as SuperAdminAuditLogQuery;
  const result = await superAdminService.getPlatformAuditLogs(query);
  ok(res, result);
});