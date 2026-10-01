// src/modules/auditLogs/auditLogs.controller.ts

import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import * as auditService from './auditLogs.service';
import type { AuditLogListQuery } from './auditLogs.validation';

// ── GET /admin/audit-logs ─────────────────────────────────────────────
export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  // Query params are already validated and typed by the validate() middleware
  const query = req.query as unknown as AuditLogListQuery;

  // Scope: a RESTAURANT_ADMIN can only see their own restaurant's logs.
  // SUPER_ADMIN can pass any restaurantId in the query or omit it for platform-wide view.
  const actorRestaurantId = req.user?.restaurantId?.toString();
  const isSuperAdmin      = req.user?.role === 'SUPER_ADMIN';

  const restaurantId = isSuperAdmin
    ? query.restaurantId               // super admin: use whatever is in the query (or undefined = all)
    : actorRestaurantId;               // restaurant admin: always scoped to their restaurant

  const result = await auditService.listAuditLogs({
    restaurantId,
    actorId:    query.actorId,
    actorRole:  query.actorRole,
    action:     query.action,
    entityType: query.entityType,
    from:       query.from,
    to:         query.to,
    page:       query.page,
    limit:      query.limit,
  });

  sendSuccess(res, result);
});

// ── GET /admin/audit-logs/:id ─────────────────────────────────────────
export const getAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const log = await auditService.getAuditLogById(req.params.id);

  if (!log) {
    throw new AppError('Audit log not found', 404, ErrorCode.NOT_FOUND);
  }

  // Scope check: restaurant admin must not read logs from another restaurant
  const isSuperAdmin      = req.user?.role === 'SUPER_ADMIN';
  const actorRestaurantId = req.user?.restaurantId?.toString();

  if (!isSuperAdmin && log.restaurantId?.toString() !== actorRestaurantId) {
    throw new AppError('Forbidden', 403, ErrorCode.FORBIDDEN);
  }

  sendSuccess(res, { log });
});
