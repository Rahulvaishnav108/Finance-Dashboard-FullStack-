import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../constants/errors';
import { AppError } from '../utils/AppError';

export const requirePasswordChange = (req: Request, res: Response, next: NextFunction) => {
  const allowedPaths = ['/auth/logout', '/auth/refresh', '/users/me/password'];
  if (allowedPaths.some(p => req.path.endsWith(p))) {
    return next();
  }

  if (req.method === 'GET' && req.path.endsWith('/users/me')) {
    return next();
  }

  if (req.user && req.user.mustChangePassword) {
    return next(new AppError('You must change your password before proceeding.', 403, ErrorCode.FORBIDDEN));
  }
  next();
};