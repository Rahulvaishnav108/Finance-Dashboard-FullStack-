import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { QueueService } from './queue.service';
import { QueueStatus } from '../../constants/statuses';

function resolveRestaurantId(req: Request, candidate?: unknown): string {
  if (req.user?.restaurantId) {
    return req.user.restaurantId;
  }
  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }
  throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
}

function mapQueueDto(entry: any, index?: number) {
  return {
    id: entry._id?.toString() || entry.id,
    name: entry.customerName,
    mobile: entry.mobile,
    guests: entry.guests,
    pax: entry.guests, // Alias for frontend
    priority: entry.priority,
    status: entry.status === QueueStatus.WAITING ? 'waiting' : entry.status.toLowerCase(),
    type: 'Walk-in', // Identity alias for frontend list merges
    queueNo: index !== undefined ? index + 1 : undefined,
    time: `${entry.etaMinutes} mins wait`,
    waitTime: `${entry.etaMinutes} mins wait`,
    tableNumber: entry.tableId?.tableNumber || '',
  };
}

export async function joinQueueController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId);

    const entry = await QueueService.joinQueue({
      restaurantId,
      customerName: req.body.customerName,
      mobile: req.body.mobile ?? '0000000000',
      guests: req.body.guests,
      priority: req.body.priority,
      etaMinutes: req.body.etaMinutes,
      notes: req.body.notes,
    });

    ok(res, { queue: mapQueueDto(entry), queueEntry: entry }, 201);
  } catch (error) {
    next(error);
  }
}

export async function listQueueController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);

    const filters = {
      status: req.query.status as QueueStatus | undefined,
    };

    const entries = await QueueService.listQueue(restaurantId, filters);

    // Compute queueNo for waiting entries by array position
    const dtos = entries.map((entry, idx) => mapQueueDto(entry, entry.status === QueueStatus.WAITING ? idx : undefined));

    ok(res, {
      queue: dtos, // Matching frontend expectation: { queue: QueueItem[] }
      meta: { count: dtos.length },
    });
  } catch (error) {
    next(error);
  }
}

export async function getQueueEntryByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const entry = await QueueService.getQueueEntryById(restaurantId, req.params.id);

    ok(res, { item: mapQueueDto(entry) });
  } catch (error) {
    next(error);
  }
}

export async function updateQueuePriorityController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);
    const entry = await QueueService.updatePriority(restaurantId, req.params.id, req.body.priority);

    ok(res, { queue: mapQueueDto(entry) });
  } catch (error) {
    next(error);
  }
}

export async function seatWalkInController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);
    const tableId = req.body.tableId;

    const entry = await QueueService.seatWalkIn(restaurantId, req.params.id, tableId);

    ok(res, { queue: mapQueueDto(entry) });
  } catch (error) {
    next(error);
  }
}

export async function cancelQueueController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);
    const entry = await QueueService.cancelQueue(restaurantId, req.params.id);

    ok(res, { queue: mapQueueDto(entry) });
  } catch (error) {
    next(error);
  }
}
