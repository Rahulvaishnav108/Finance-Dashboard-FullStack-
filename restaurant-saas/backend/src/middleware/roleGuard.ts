import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../constants/errors';
import { AppError } from '../utils/AppError';

export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403, ErrorCode.FORBIDDEN));
      return;
    }

    next();
  };
}
