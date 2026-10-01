import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../constants/errors';
import { verifyAccessToken } from '../services/jwt.service';
import { AppError } from '../utils/AppError';
import type { Panel } from '../constants/roles';
import { KitchenRole, StaffInternalRole, CleaningRole } from '../constants/roles';

// ── Generic auth (unchanged behaviour, now also maps panel/internal_role) ──

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.header('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED));
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    next(new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      _id: payload._id,
      id: payload._id,
      email: payload.email,
      role: payload.role,
      restaurantId: payload.restaurantId,
      panel: payload.panel,
      internal_role: payload.internal_role,
      mustChangePassword: payload.mustChangePassword,
    };

    next();
  } catch (error) {
    next(error as Error);
  }
}

export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = verifyAccessToken(token);

        req.user = {
          _id: decoded._id,
          id: decoded._id,
          email: decoded.email,
          role: decoded.role,
          restaurantId: decoded.restaurantId,
          panel: decoded.panel,
          internal_role: decoded.internal_role,
        };
      } catch {
        // Silent fail; req.user remains undefined.
      }
    }
  }

  next();
}

// ── Panel-specific authentication middlewares ──────────────────────────
// Each one calls requireAuth first, then verifies the token's `panel` claim.

const PANEL_HIERARCHY: Record<Panel, Panel[]> = {
  customer: ['customer'],
  kitchen: ['kitchen', 'admin', 'superadmin'],
  staff: ['staff', 'admin', 'superadmin'],
  cleaning: ['cleaning', 'admin', 'superadmin'],
  admin: ['admin', 'superadmin'],
  superadmin: ['superadmin'],
};

function authenticatePanel(expectedPanel: Panel) {
  return (req: Request, res: Response, next: NextFunction): void => {
    requireAuth(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }

      if (!req.user) {
        next(new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED));
        return;
      }

      const allowedPanels = PANEL_HIERARCHY[expectedPanel] || [expectedPanel];
      if (!allowedPanels.includes(req.user.panel as Panel)) {
        next(
          new AppError(
            `This endpoint requires ${expectedPanel} panel authentication`,
            403,
            ErrorCode.FORBIDDEN,
          ),
        );
        return;
      }

      next();
    });
  };
}

export const authenticateCustomer   = authenticatePanel('customer');
export const authenticateKitchen    = authenticatePanel('kitchen');
export const authenticateStaff      = authenticatePanel('staff');
export const authenticateCleaning   = authenticatePanel('cleaning');
export const authenticateAdmin      = authenticatePanel('admin');
export const authenticateSuperAdmin = authenticatePanel('superadmin');

// ── Internal role authorization guards ────────────────────────────────
// Usage: router.use(authenticateKitchen, requireKitchenRole(['HEAD_CHEF', 'KITCHEN_SUPERVISOR']))

export function requireKitchenRole(allowedRoles: KitchenRole[]) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    if (!_req.user) {
      next(new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED));
      return;
    }

    const internalRole = _req.user.internal_role as KitchenRole | undefined;

    if (!internalRole || !allowedRoles.includes(internalRole)) {
      next(
        new AppError(
          `Requires one of: ${allowedRoles.join(', ')}`,
          403,
          ErrorCode.FORBIDDEN,
        ),
      );
      return;
    }

    next();
  };
}

export function requireStaffRole(allowedRoles: StaffInternalRole[]) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    if (!_req.user) {
      next(new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED));
      return;
    }

    const internalRole = _req.user.internal_role as StaffInternalRole | undefined;

    if (!internalRole || !allowedRoles.includes(internalRole)) {
      next(
        new AppError(
          `Requires one of: ${allowedRoles.join(', ')}`,
          403,
          ErrorCode.FORBIDDEN,
        ),
      );
      return;
    }

    next();
  };
}

export function requireCleaningRole(allowedRoles: CleaningRole[]) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    if (!_req.user) {
      next(new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED));
      return;
    }

    const internalRole = _req.user.internal_role as CleaningRole | undefined;

    if (!internalRole || !allowedRoles.includes(internalRole)) {
      next(
        new AppError(
          `Requires one of: ${allowedRoles.join(', ')}`,
          403,
          ErrorCode.FORBIDDEN,
        ),
      );
      return;
    }

    next();
  };
}