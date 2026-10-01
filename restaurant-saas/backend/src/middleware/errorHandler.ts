import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import logger from '../config/logger';
import { ErrorCode, type ErrorCodeType } from '../constants/errors';
import { AppError as BaseAppError } from '../utils/AppError';

export class AppError extends BaseAppError {
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: ErrorCodeType, fields?: Record<string, string[]>);
  constructor(statusCode: number, code: ErrorCodeType, message: string, details?: unknown);
  constructor(
    first: number | string,
    second: number | ErrorCodeType,
    third: string,
    fourth?: Record<string, string[]> | unknown,
  ) {
    if (typeof first === 'number') {
      super(third, first, second as ErrorCodeType);
      this.details = fourth;
      return;
    }

    super(first, second as number, third as ErrorCodeType, fourth as Record<string, string[]> | undefined);
    this.details = undefined;
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, ErrorCode.NOT_FOUND, `Route not found: ${req.method} ${req.originalUrl}`));
}

function sendOperationalError(req: Request, res: Response, error: BaseAppError & { details?: unknown }): void {
  logger.warn(error.message, {
    code: error.code,
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  });

  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.fields && { fields: error.fields }),
      ...(error.details !== undefined && { details: error.details }),
      requestId: req.requestId,
    },
  });
}

export function errorHandler(error: Error, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof BaseAppError) {
    sendOperationalError(req, res, error as BaseAppError & { details?: unknown });
    return;
  }

  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.') || 'unknown';
      if (!fields[path]) {
        fields[path] = [];
      }
      fields[path].push(issue.message);
    }

    sendOperationalError(req, res, new AppError('Validation failed', 400, ErrorCode.VALIDATION_ERROR, fields));
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const fields: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(error.errors)) {
      fields[key] = [value.message];
    }

    sendOperationalError(req, res, new AppError('Validation failed', 400, ErrorCode.VALIDATION_ERROR, fields));
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    sendOperationalError(
      req,
      res,
      new AppError(`Invalid ${error.path}: ${error.value}`, 400, ErrorCode.INVALID_REQUEST),
    );
    return;
  }

  if ((error as { code?: number }).code === 11000) {
    const keyValue = (error as { keyValue?: Record<string, unknown> }).keyValue ?? {};
    const field = Object.keys(keyValue)[0] ?? 'field';
    sendOperationalError(
      req,
      res,
      new AppError(`A record with this ${field} already exists`, 409, ErrorCode.CONFLICT),
    );
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendOperationalError(req, res, new AppError('Access token expired', 401, ErrorCode.TOKEN_EXPIRED));
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    sendOperationalError(req, res, new AppError('Invalid token', 401, ErrorCode.TOKEN_INVALID));
    return;
  }

  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    name: error.name,
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  });

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
      requestId: req.requestId,
    },
  });
}
