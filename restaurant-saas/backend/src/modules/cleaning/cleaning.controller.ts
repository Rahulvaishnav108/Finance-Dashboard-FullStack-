import type { NextFunction, Request, Response } from 'express';
import { CleaningStatus, TableStatus } from '../../constants/statuses';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { updateTableStatus } from '../tables/tables.service';
import { CleaningTaskModel } from './cleaning.model';
import { logger } from '../../config/logger';

function ensureCleaningStatus(currentStatus: CleaningStatus, allowedStatuses: CleaningStatus[], message: string): void {
  if (!allowedStatuses.includes(currentStatus)) {
    throw new AppError(message, 400, ErrorCode.INVALID_REQUEST);
  }
}

export class CleaningController {
  private static getRequiredRestaurantId(req: Request) {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
    }

    return restaurantId;
  }

  private static async getTaskForRestaurant(req: Request) {
    const restaurantId = CleaningController.getRequiredRestaurantId(req);
    const task = await CleaningTaskModel.findOne({
      _id: req.params.id,
      restaurantId,
    });

    if (!task) {
      throw new AppError('Cleaning task not found', 404, ErrorCode.NOT_FOUND);
    }

    return task;
  }

  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = CleaningController.getRequiredRestaurantId(req);
      const { status, priority } = req.query;
      const query: Record<string, unknown> = { restaurantId };

      if (status) query.status = status;
      if (priority) query.priority = priority;

      const tasks = await CleaningTaskModel.find(query).sort({ createdAt: -1 });

      ok(res, {
        tasks,
        meta: {
          count: tasks.length,
          filters: {
            status: status ?? null,
            priority: priority ?? null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await CleaningController.getTaskForRestaurant(req);
      ok(res, { task });
    } catch (error) {
      next(error);
    }
  }

  static async startTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await CleaningController.getTaskForRestaurant(req);

      ensureCleaningStatus(task.status, [CleaningStatus.PENDING], 'Only pending cleaning tasks can be started');

      const startedBy = req.body?.staffId ?? req.user?.id ?? null;
      task.status = CleaningStatus.IN_PROGRESS;
      task.startedAt = new Date();
      task.startedBy = startedBy;
      task.completedAt = null;
      task.completedBy = null;
      task.verifiedAt = null;
      task.verifiedBy = null;
      await task.save();

      await updateTableStatus(
        task.tableId.toString(),
        TableStatus.CLEANING_IN_PROGRESS,
        task.restaurantId.toString()
      );

      logger.info('Cleaning task started', { taskId: task._id, tableId: task.tableId });

      ok(res, { task, startedBy });
    } catch (error) {
      next(error);
    }
  }

  static async completeTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await CleaningController.getTaskForRestaurant(req);

      ensureCleaningStatus(task.status, [CleaningStatus.IN_PROGRESS], 'Only in-progress cleaning tasks can be completed');

      task.status = CleaningStatus.COMPLETED;
      task.completedAt = new Date();
      task.completedBy = req.body?.staffId ?? req.user?.id ?? null;
      task.verifiedAt = null;
      task.verifiedBy = null;
      await task.save();

      await updateTableStatus(
        task.tableId.toString(),
        TableStatus.NEEDS_CLEANING,
        task.restaurantId.toString()
      );

      logger.info('Cleaning task completed', { taskId: task._id, tableId: task.tableId });

      ok(res, { task });
    } catch (error) {
      next(error);
    }
  }

  static async verifyTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await CleaningController.getTaskForRestaurant(req);

      ensureCleaningStatus(task.status, [CleaningStatus.COMPLETED], 'Only completed cleaning tasks can be verified');

      task.status = CleaningStatus.VERIFIED;
      task.verifiedAt = new Date();
      task.verifiedBy = req.body?.verifiedBy ?? req.user?.id ?? null;
      await task.save();

      await updateTableStatus(
        task.tableId.toString(),
        TableStatus.AVAILABLE,
        task.restaurantId.toString()
      );

      logger.info('Cleaning task verified', { taskId: task._id, tableId: task.tableId });

      ok(res, { task });
    } catch (error) {
      next(error);
    }
  }
}
