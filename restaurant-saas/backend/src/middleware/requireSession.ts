// src/middleware/requireSession.ts
// Session-based auth middleware for customer (QR session) routes
// Replaces JWT auth for customer-facing endpoints

import { Request, Response, NextFunction } from 'express';
import * as sessionService from '../modules/tableSessions/tableSessions.service';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants/errors';

/**
 * Middleware: validates x-session-token header and attaches session to req.
 * - Checks session exists and is ACTIVE
 * - Validates hard expiry (QR_SESSION_EXPIRES_IN_MINUTES)
 * - Validates idle timeout (SESSION_IDLE_TIMEOUT_MINUTES)
 * - Touches lastActivityAt on every valid request
 *
 * Usage: router.post('/customer/orders', requireSession, handler)
 */
export async function requireSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.headers['x-session-token'] as string;

    if (!token) {
      throw new AppError(
        'Session token required. Pass x-session-token header.',
        401,
        ErrorCode.SESSION_INVALID
      );
    }

    // Validate session (checks ACTIVE, hard expiry, idle timeout)
    const session = await sessionService.validateSession(token);

    // Touch activity timestamp
    await sessionService.touchActivity(session._id.toString());

    // Attach session to request for downstream handlers
    req.tableSession = {
      _id: session._id.toString(),
      restaurantId: session.restaurantId.toString(),
      tableId: session.tableId.toString(),
      customerName: session.customerName,
      mobile: session.mobile,
    };

    next();
  } catch (error) {
    next(error);
  }
}
