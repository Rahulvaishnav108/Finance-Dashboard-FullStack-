// src/utils/response.ts
// Standard response helpers — enforce consistent { success, data } shape

import { Response } from 'express';
import { PaginationMeta } from '../types/api.types';

/**
 * Send a standard success response.
 * Shape: { success: true, data: T }
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send a paginated success response.
 * Shape: { success: true, data: T[], pagination: {...} }
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
}

/**
 * Send a standard error response.
 * Shape: { success: false, error: { code, message, fields? } }
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  fields?: Record<string, string[]>
): void {
  const error: Record<string, unknown> = { code, message };
  if (fields) error.fields = fields;

  res.status(statusCode).json({
    success: false,
    error,
  });
}
