// src/modules/auditLogs/auditLogs.helper.ts
// Fire-and-forget helper. Import this in any controller or service to write
// an audit log without blocking the main response or throwing on failure.
//
// Usage:
//   import { logAudit } from '../auditLogs/auditLogs.helper';
//
//   await logAudit(req, {
//     entityType: AuditEntity.ORDER,
//     entityId:   order._id.toString(),
//     action:     AuditAction.ORDER_PLACED,
//     metadata:   { total: order.totalAmount },
//   });

import type { Request } from 'express';
import logger from '../../config/logger';
import { AuditLogModel } from './auditLogs.schema';
import type { CreateAuditLogInput } from './auditLogs.types';

// ── Full input helper (use when req is not available, e.g. in a service) ──
export async function logAuditRaw(input: CreateAuditLogInput): Promise<void> {
  try {
    await AuditLogModel.create(input);
  } catch (err) {
    // Log the failure but NEVER re-throw — audit logs must not break business logic
    logger.error('[AuditLog] Failed to write audit log', {
      error: err,
      input,
    });
  }
}

// ── Request-aware helper (use inside Express controllers) ────────────
// Automatically extracts actorId, actorRole, restaurantId, ipAddress,
// and userAgent from the request object.
export async function logAudit(
  req: Request,
  payload: Omit<CreateAuditLogInput, 'actorId' | 'actorRole' | 'restaurantId' | 'ipAddress' | 'userAgent'> &
    Partial<Pick<CreateAuditLogInput, 'restaurantId' | 'ipAddress' | 'userAgent'>>,
): Promise<void> {
  // req.user is attached by requireAuth middleware (JWT flow)
  // If not present (e.g. public route), we skip logging silently
  if (!req.user) {
    logger.warn('[AuditLog] logAudit called without req.user — skipping', {
      action: payload.action,
    });
    return;
  }

  const input: CreateAuditLogInput = {
    actorId:      req.user._id.toString(),
    actorRole:    req.user.role,
    restaurantId: payload.restaurantId ?? req.user.restaurantId?.toString(),
    entityType:   payload.entityType,
    entityId:     payload.entityId,
    action:       payload.action,
    metadata:     payload.metadata ?? {},
    ipAddress:    payload.ipAddress ?? req.ip ?? undefined,
    userAgent:    payload.userAgent ?? req.headers['user-agent'] ?? undefined,
  };

  await logAuditRaw(input);
}