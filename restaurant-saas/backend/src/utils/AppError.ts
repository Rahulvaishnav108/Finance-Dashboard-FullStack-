// src/utils/AppError.ts
// Custom application error class for operational errors

import { ErrorCodeType } from '../constants/errors';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCodeType;
  public readonly isOperational: boolean;
  public readonly fields?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCodeType,
    fields?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.fields = fields;

    // Preserve proper stack trace
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
