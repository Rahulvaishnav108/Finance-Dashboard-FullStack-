import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/auth.types';
import * as sessionService from '../modules/tableSessions/tableSessions.service';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants/errors';

/**
 * Middleware supporting hybrid authentication:
 * Validates either an `x-session-token` (customer session) or a JWT Bearer token (staff/admin).
 * Attaches either `req.tableSession` or `req.user` respectively.
 */
export async function requireUserOrSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionToken = req.headers['x-session-token'] as string;
  const authHeader = req.headers.authorization;

  // 1. Try validating Customer QR Session Token if header is present
  if (sessionToken) {
    try {
      const session = await sessionService.validateSession(sessionToken);
      await sessionService.touchActivity(session._id.toString());

      req.tableSession = {
        _id: session._id.toString(),
        restaurantId: session.restaurantId.toString(),
        tableId: session.tableId.toString(),
        customerName: session.customerName,
        mobile: session.mobile,
      };
      return next();
    } catch (error) {
      // If there is no fallback auth header, return the session error immediately
      if (!authHeader) {
        return next(error);
      }
    }
  }

  // 2. Try validating Staff/Admin Bearer JWT if header is present
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = {
          _id: decoded._id,
          id: decoded._id,
          email: decoded.email,
          role: decoded.role,
          restaurantId: decoded.restaurantId,
        };
        return next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          return next(new AppError('Access token expired', 401, ErrorCode.TOKEN_EXPIRED));
        }
        if (error instanceof jwt.JsonWebTokenError) {
          return next(new AppError('Invalid token', 401, ErrorCode.TOKEN_INVALID));
        }
        return next(error);
      }
    }
  }

  // 3. Fallback: Neither valid credential was provided
  return next(
    new AppError(
      'Authentication required. Provide a valid JWT access token or x-session-token header.',
      401,
      ErrorCode.UNAUTHORIZED
    )
  );
}
