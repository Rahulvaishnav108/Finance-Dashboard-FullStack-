import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ErrorCode } from '../constants/errors';

const defaultMessage = {
  success: false,
  error: {
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests, please try again later',
  },
};

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: defaultMessage,
});

export const authLimiter = rateLimit({
  windowMs: 60_000,
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many authentication attempts, please try again later',
    },
  },
});

export const publicLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: defaultMessage,
});

export const sessionLimiter = rateLimit({
  windowMs: 60_000,
  max: env.SESSION_RATE_LIMIT_MAX_REQUESTS,
  keyGenerator: (req) => req.ip || 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many session creation attempts. Please wait before scanning again.',
    },
  },
});

export const apiRateLimiter = globalLimiter;
export const authRateLimiter = authLimiter;
