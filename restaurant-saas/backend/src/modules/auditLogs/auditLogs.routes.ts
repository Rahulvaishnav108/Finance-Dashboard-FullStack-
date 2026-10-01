// src/modules/auditLogs/auditLogs.routes.ts
// Mounted at /api/v1/admin/audit-logs (see main router registration below)

import { Router } from 'express';
import { requireAuth }  from '../../middleware/requireAuth';
import { roleGuard }    from '../../middleware/roleGuard';
import { validate }     from '../../middleware/validate';
import { UserRole }     from '../../constants/roles';
import { listAuditLogs, getAuditLog } from './auditLogs.controller';
import { listEmailLogs } from './emailLogs.controller';
import {
  auditLogListQuerySchema,
  auditLogIdParamSchema,
} from './auditLogs.validation';

const router = Router();

// Both endpoints require JWT auth + admin-level role
const adminRoles = [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN];

// GET /admin/audit-logs
router.get(
  '/',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ query: auditLogListQuerySchema }),
  listAuditLogs,
);

// GET /admin/audit-logs/email-logs/all
router.get(
  '/emails/logs',
  requireAuth,
  roleGuard(...adminRoles),
  listEmailLogs,
);

// GET /admin/audit-logs/:id
router.get(
  '/:id',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: auditLogIdParamSchema }),
  getAuditLog,
);

export default router;