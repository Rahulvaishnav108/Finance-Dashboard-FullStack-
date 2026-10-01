import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { CleaningTaskModel } from '../cleaning/cleaning.model';
import { ok } from '../../utils/responses';
import { CleaningStatus, TableStatus } from '../../constants/statuses';
import { TableModel } from '../tables/tables.model';
import {
  cleaningTaskParamsSchema,
  cleaningTaskQuerySchema,
  completeCleaningBodySchema,
  startCleaningBodySchema,
  verifyCleaningBodySchema,
} from '../cleaning/cleaning.schema';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';

export const cleaningRouter = Router();

function ensureCleaningStatus(currentStatus: CleaningStatus, allowedStatuses: CleaningStatus[], message: string): void {
  if (!allowedStatuses.includes(currentStatus)) {
    throw new AppError(message, 400, ErrorCode.INVALID_REQUEST);
  }
}

cleaningRouter.get('/tasks', validate({ query: cleaningTaskQuerySchema }), async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const query: Record<string, unknown> = { restaurantId: req.user?.restaurantId };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await CleaningTaskModel.find(query).populate('tableId').sort({ createdAt: -1 });
    const responseTasks = tasks.map((task) => {
      const taskObj = task.toObject() as any;
      if (taskObj.tableId && typeof taskObj.tableId === 'object') {
        taskObj.tableDetails = taskObj.tableId;
        taskObj.tableId = (taskObj.tableId as any)._id?.toString() || String(taskObj.tableId);
      }
      return taskObj;
    });

    ok(res, {
      tasks: responseTasks,
      meta: {
        count: responseTasks.length,
        filters: {
          status: status ?? null,
          priority: priority ?? null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

cleaningRouter.get('/tasks/:id', validate({ params: cleaningTaskParamsSchema }), async (req, res, next) => {
  try {
    const task = await CleaningTaskModel.findOne({
      _id: req.params.id,
      restaurantId: req.user?.restaurantId,
    }).populate('tableId');

    if (!task) {
      throw new AppError('Cleaning task not found', 404, ErrorCode.NOT_FOUND);
    }

    const taskObj = task.toObject() as any;
    if (taskObj.tableId && typeof taskObj.tableId === 'object') {
      taskObj.tableDetails = taskObj.tableId;
      taskObj.tableId = (taskObj.tableId as any)._id?.toString() || String(taskObj.tableId);
    }

    ok(res, { task: taskObj });
  } catch (error) {
    next(error);
  }
});

cleaningRouter.patch(
  '/tasks/:id/start',
  validate({ params: cleaningTaskParamsSchema, body: startCleaningBodySchema }),
  async (req, res, next) => {
  try {
    const task = await CleaningTaskModel.findOne({
      _id: req.params.id,
      restaurantId: req.user?.restaurantId,
    });

    if (!task) {
      throw new AppError('Cleaning task not found', 404, ErrorCode.NOT_FOUND);
    }

    ensureCleaningStatus(task.status, [CleaningStatus.PENDING], 'Only pending cleaning tasks can be started');

    task.status = CleaningStatus.IN_PROGRESS;
    task.startedAt = new Date();
    task.startedBy = req.body?.staffId ?? req.user?.id ?? null;
    task.completedAt = null;
    task.completedBy = null;
    task.verifiedAt = null;
    task.verifiedBy = null;
    await task.save();

    await TableModel.findOneAndUpdate(
      { _id: task.tableId, restaurantId: task.restaurantId },
      { status: TableStatus.CLEANING_IN_PROGRESS },
    );

    ok(res, { task, startedBy: req.body?.staffId ?? req.user?.id ?? null });
  } catch (error) {
    next(error);
  }
});

cleaningRouter.patch(
  '/tasks/:id/complete',
  validate({ params: cleaningTaskParamsSchema, body: completeCleaningBodySchema }),
  async (req, res, next) => {
  try {
    const task = await CleaningTaskModel.findOne({
      _id: req.params.id,
      restaurantId: req.user?.restaurantId,
    });

    if (!task) {
      throw new AppError('Cleaning task not found', 404, ErrorCode.NOT_FOUND);
    }

    ensureCleaningStatus(task.status, [CleaningStatus.IN_PROGRESS], 'Only in-progress cleaning tasks can be completed');

    task.status = CleaningStatus.COMPLETED;
    task.completedAt = new Date();
    task.completedBy = req.body?.staffId ?? req.user?.id ?? null;
    task.verifiedAt = null;
    task.verifiedBy = null;
    await task.save();

    await TableModel.findOneAndUpdate(
      { _id: task.tableId, restaurantId: task.restaurantId },
      {
        status: TableStatus.AVAILABLE,
        currentSessionId: null,
      },
    );

    ok(res, { task });
  } catch (error) {
    next(error);
  }
});

cleaningRouter.patch(
  '/tasks/:id/verify',
  validate({ params: cleaningTaskParamsSchema, body: verifyCleaningBodySchema }),
  async (req, res, next) => {
  try {
    const task = await CleaningTaskModel.findOne({
      _id: req.params.id,
      restaurantId: req.user?.restaurantId,
    });

    if (!task) {
      throw new AppError('Cleaning task not found', 404, ErrorCode.NOT_FOUND);
    }

    ensureCleaningStatus(task.status, [CleaningStatus.COMPLETED], 'Only completed cleaning tasks can be verified');

    task.status = CleaningStatus.VERIFIED;
    task.verifiedAt = new Date();
    task.verifiedBy = req.body?.verifiedBy ?? req.user?.id ?? null;
    await task.save();

    await TableModel.findOneAndUpdate(
      { _id: task.tableId, restaurantId: task.restaurantId },
      {
        status: TableStatus.AVAILABLE,
        currentSessionId: null,
      },
    );

    ok(res, { task });
  } catch (error) {
    next(error);
  }
});
