import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants/errors';
import { UserRole } from '../constants/roles';

export function tenantGuard(req: Request, _res: Response, next: NextFunction): void {
  // 1. Super Admin bypasses tenant isolation
  if (req.user?.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // 2. Identify the active tenant ID from the authenticated user or customer session
  const userTenantId = req.user?.restaurantId?.toString() || req.tableSession?.restaurantId?.toString();

  if (!userTenantId) {
    return next(new AppError('Restaurant context required', 403, ErrorCode.TENANT_VIOLATION));
  }

  // 3. Extract any candidate tenant ID from request inputs
  let candidateTenantId =
    req.params.restaurantId ||
    req.query.restaurantId ||
    req.body.restaurantId ||
    req.headers['x-restaurant-id'];

  if (req.body?.tables && Array.isArray(req.body.tables)) {
    for (const table of req.body.tables) {
      if (table.restaurantId && table.restaurantId.toString() !== userTenantId) {
        candidateTenantId = table.restaurantId;
        break;
      }
    }
  }

  if (candidateTenantId && candidateTenantId.toString() !== userTenantId) {
    return next(
      new AppError(
        'Cross-tenant access denied',
        403,
        ErrorCode.TENANT_VIOLATION
      )
    );
  }

  // 4. Force inject/overwrite route context to match verified tenant ID (Prevent ID spoofing)
  if (req.body) {
    req.body.restaurantId = userTenantId;
    if (req.body.tables && Array.isArray(req.body.tables)) {
      for (const table of req.body.tables) {
        table.restaurantId = userTenantId;
      }
    }
  }
  if (req.query) {
    req.query.restaurantId = userTenantId;
  }

  next();
}
