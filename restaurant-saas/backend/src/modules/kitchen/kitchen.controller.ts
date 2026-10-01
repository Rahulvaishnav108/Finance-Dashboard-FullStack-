import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { logAudit } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import { OrdersService } from '../orders/orders.service';
import { InventoryService } from '../inventory/inventory.service';
import { KitchenService } from './kitchen.service';

export class KitchenController {
  private static getRequiredRestaurantId(req: Request) {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
    }

    return restaurantId;
  }

  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const metrics = await KitchenService.getDashboard(restaurantId);

      ok(res, { metrics });
    } catch (error) {
      next(error);
    }
  }

  static async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
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

  static async getInventoryAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
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

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const orders = await KitchenService.getOrders(restaurantId, {
        status: req.query.status as any,
        priority: req.query.priority as string | undefined,
        table: req.query.table as string | undefined,
        batch: req.query.batch as boolean | undefined,
      });

      ok(res, {
        orders,
        meta: {
          count: orders.length,
          filters: {
            status: req.query.status ?? null,
            priority: req.query.priority ?? null,
            table: req.query.table ?? null,
            batch: req.query.batch ?? null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const order = await KitchenService.getOrderDetails(restaurantId, req.params.id);

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  static async acceptOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const order = await OrdersService.acceptOrder(
        restaurantId,
        req.params.id,
        req.body.estimatedPreparationTime,
        req.user?.id,
      );

      await logAudit(req, {
        entityType: AuditEntity.ORDER,
        entityId: order._id.toString(),
        action: AuditAction.KITCHEN_ORDER_ACCEPTED,
        metadata: { estimatedPreparationTime: req.body.estimatedPreparationTime },
      });

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  static async startCooking(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const order = await OrdersService.startCooking(restaurantId, req.params.id, req.user?.id);

      await logAudit(req, {
        entityType: AuditEntity.ORDER,
        entityId: order._id.toString(),
        action: AuditAction.KITCHEN_ORDER_STARTED,
      });

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  static async markReady(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const order = await OrdersService.markReady(restaurantId, req.params.id, req.user?.id);

      await logAudit(req, {
        entityType: AuditEntity.ORDER,
        entityId: order._id.toString(),
        action: AuditAction.KITCHEN_ORDER_READY,
      });

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  static async delayOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const order = await OrdersService.delayOrder(restaurantId, req.params.id, req.body.delayMinutes, req.user?.id);

      await logAudit(req, {
        entityType: AuditEntity.ORDER,
        entityId: order._id.toString(),
        action: AuditAction.KITCHEN_ORDER_DELAYED,
        metadata: { delayMinutes: req.body.delayMinutes },
      });

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  static async rejectOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const order = await OrdersService.rejectOrder(restaurantId, req.params.id, req.body.reason, req.user?.id);

      await logAudit(req, {
        entityType: AuditEntity.ORDER,
        entityId: order._id.toString(),
        action: AuditAction.KITCHEN_ORDER_REJECTED,
        metadata: { reason: req.body.reason },
      });

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  static async getBatches(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const batches = await KitchenService.getBatches(restaurantId);

      ok(res, {
        batches,
        meta: {
          count: batches.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const batch = await KitchenService.getBatchById(restaurantId, req.params.id);

      ok(res, { batch });
    } catch (error) {
      next(error);
    }
  }

  static async createBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const batch = await KitchenService.createBatch(restaurantId, req.body);

      await logAudit(req, {
        entityType: AuditEntity.KITCHEN,
        entityId: batch._id.toString(),
        action: AuditAction.ADMIN_SETTINGS_UPDATED,
        metadata: { event: 'KITCHEN_BATCH_CREATED', orderIds: req.body.orderIds, station: req.body.station },
      });

      ok(res, { batch }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const batch = await KitchenService.updateBatch(restaurantId, req.params.id, req.body);

      await logAudit(req, {
        entityType: AuditEntity.KITCHEN,
        entityId: batch._id.toString(),
        action: AuditAction.ADMIN_SETTINGS_UPDATED,
        metadata: { event: 'KITCHEN_BATCH_UPDATED', ...req.body },
      });

      ok(res, { batch });
    } catch (error) {
      next(error);
    }
  }

  static async getLoad(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const stations = await KitchenService.getStationLoad(restaurantId);

      ok(res, {
        stations,
        meta: {
          count: stations.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = KitchenController.getRequiredRestaurantId(req);
      const chefs = await KitchenService.getPerformance(restaurantId);

      ok(res, {
        chefs,
        meta: {
          count: chefs.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
