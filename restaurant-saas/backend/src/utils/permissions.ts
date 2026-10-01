// src/utils/permissions.ts
// Ownership check helper — per instruction.md: always 404 (never 403) for wrong user

import { Model, Types } from 'mongoose';
import { AppError } from './AppError';
import { ErrorCode } from '../constants/errors';

/**
 * Assert that a resource belongs to the requesting user's restaurant.
 * Always returns 404 (not 403) to avoid confirming resource existence.
 */
export async function assertOwnership<T>(
  ModelClass: Model<T>,
  resourceId: string,
  restaurantId: string,
  additionalFilter?: Record<string, unknown>
): Promise<T> {
  if (!Types.ObjectId.isValid(resourceId)) {
    throw new AppError('Resource not found', 404, ErrorCode.NOT_FOUND);
  }

  const filter: Record<string, unknown> = {
    _id: new Types.ObjectId(resourceId),
    restaurantId: new Types.ObjectId(restaurantId),
    ...additionalFilter,
  };

  const doc = await ModelClass.findOne(filter);
  if (!doc) {
    throw new AppError('Resource not found', 404, ErrorCode.NOT_FOUND);
  }
  return doc;
}

/**
 * Assert resource belongs to a specific user (by userId field).
 */
export async function assertUserOwnership<T>(
  ModelClass: Model<T>,
  resourceId: string,
  userId: string
): Promise<T> {
  if (!Types.ObjectId.isValid(resourceId)) {
    throw new AppError('Resource not found', 404, ErrorCode.NOT_FOUND);
  }

  const doc = await ModelClass.findOne({
    _id: new Types.ObjectId(resourceId),
    userId: new Types.ObjectId(userId),
  });

  if (!doc) {
    throw new AppError('Resource not found', 404, ErrorCode.NOT_FOUND);
  }
  return doc;
}
