// src/utils/date.ts
// Date utility helpers

/**
 * Get a future date from now by adding minutes.
 */
export function addMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Get a future date from now by adding hours.
 */
export function addHours(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Get a future date from now by adding days.
 */
export function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Check if a date has passed (is expired).
 */
export function isExpired(date: Date): boolean {
  return new Date() > new Date(date);
}

/**
 * Parse a JWT expiry string like "15m", "7d", "1h" into milliseconds.
 */
export function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)(m|h|d)$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: throw new Error(`Unknown time unit: ${unit}`);
  }
}
