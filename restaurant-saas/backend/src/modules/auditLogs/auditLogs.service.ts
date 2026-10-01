// src/modules/auditLogs/auditLogs.service.ts
// Read-only query logic for the audit log admin APIs.
// Write path is handled exclusively by auditLogs.helper.ts

import { FilterQuery } from 'mongoose';
import { AuditLogModel, IAuditLog } from './auditLogs.schema';
import type { AuditLogFilters } from './auditLogs.types';


const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;

// ── List audit logs with filters + pagination ─────────────────────────
export async function listAuditLogs(filters: AuditLogFilters) {
  const {
    restaurantId,
    actorId,
    actorRole,
    action,
    entityType,
    from,
    to,
    page  = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  } = filters;

  // Build the Mongoose filter object dynamically
  const query: FilterQuery<IAuditLog> = {};

  if (restaurantId) query.restaurantId = restaurantId;
  if (actorId)      query.actorId      = actorId;
  if (actorRole)    query.actorRole    = actorRole;
  if (action)       query.action       = action;
  if (entityType)   query.entityType   = entityType;

  // Date range on createdAt
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to)   query.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
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

// ── Get a single audit log by ID ──────────────────────────────────────
export async function getAuditLogById(id: string) {
  return AuditLogModel.findById(id).lean<IAuditLog>();
}
