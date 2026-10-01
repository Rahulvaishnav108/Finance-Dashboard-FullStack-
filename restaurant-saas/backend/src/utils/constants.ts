// src/utils/constants.ts
// Shared magic numbers and strings used across the app

/** Cookie configuration */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

/** Account lockout configuration */
export const LOCKOUT = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCK_DURATION_MINUTES: 15,
};

/** HTTP Headers */
export const Headers = {
  REQUEST_ID: 'X-Request-Id',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
};

/** API version prefix */
export const API_PREFIX = '/api/v1';
