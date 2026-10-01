import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { InventoryService } from './inventory.service';
import { InventoryTransactionService } from './inventoryTransaction.service';

function resolveRestaurantId(req: Request, candidate?: unknown): string {
  if (req.user?.restaurantId) {
    return req.user.restaurantId;
  }

  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }

  throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
}

function getActor(req: Request) {
  return req.user ? { id: req.user.id, role: req.user.role } : { id: 'system', role: 'system' };
}

export async function createInventoryItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId);
    const item = await InventoryService.createInventoryItem(restaurantId, req.body, getActor(req));

    ok(res, { item }, 201);
  } catch (error) {
    next(error);
  }
}

export async function bulkImportController(req: Request, res: Response, next: NextFunction) {
  try {
    // Determine restaurantId from user context or body (if admin)
    // The payload is an array, so we check if req.user has restaurantId
    const restaurantId = resolveRestaurantId(req);
    const result = await InventoryService.bulkImportInventory(restaurantId, req.body, getActor(req));

    ok(res, result, 201);
  } catch (error) {
    next(error);
  }
}

export async function listInventoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const active = typeof req.query.active === 'boolean' ? req.query.active : undefined;

    const items = await InventoryService.listInventoryItems(restaurantId, search, active);

    ok(res, {
      items,
      meta: {
        count: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateInventoryItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);
    const item = await InventoryService.updateInventoryItem(restaurantId, req.params.id, req.body, getActor(req));

    ok(res, { item });
  } catch (error) {
    next(error);
  }
}

export async function getInventoryAlertsController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const items = await InventoryService.getInventoryAlerts(restaurantId);

    ok(res, {
      alerts: items.map((item) => ({
        ...item,
        shortage: Math.max(0, item.threshold - item.stock),
      })),
      meta: {
        count: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteInventoryItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    await InventoryService.deleteInventoryItem(restaurantId, req.params.id, getActor(req));

    ok(res, { message: 'Inventory item successfully deleted' });
  } catch (error) {
    next(error);
  }
}

export async function getInventoryStatsController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);

    const stats = await InventoryService.getInventoryStats(restaurantId);

    ok(res, { stats });
  } catch (error) {
    next(error);
  }
}

export async function getInventoryItemByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const item = await InventoryService.getInventoryItemById(restaurantId, req.params.id);

    ok(res, { item });
  } catch (error) {
    next(error);
  }
}

export async function getItemTransactionsController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const transactions = await InventoryTransactionService.getItemTransactions(restaurantId, req.params.id);

    ok(res, {
      transactions,
      meta: {
        count: transactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
