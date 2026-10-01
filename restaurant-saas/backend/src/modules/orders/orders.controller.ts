// src/modules/orders/orders.controller.ts
// Order route handlers — session-based customer + JWT staff/kitchen

import { Request, Response, NextFunction } from 'express';
import { OrdersService } from './orders.service';
import { ok } from '../../utils/responses';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { logAudit, logAuditRaw } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import * as LoyaltyService from '../loyalty/loyalty.service';

export class OrdersController {
  private static getRequiredSession(req: Request) {
    const session = req.tableSession;
    if (!session) {
      throw new AppError('Session required', 401, ErrorCode.UNAUTHORIZED);
    }
    return session;
  }

  private static getRequiredRestaurantId(req: Request) {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
    }
    return restaurantId;
  }

  /*
  |--------------------------------------------------------------------------
  | SESSION-BASED CUSTOMER APIs
  | Customer authenticated via QR session token (req.tableSession)
  |--------------------------------------------------------------------------
  */

  // POST /customer/orders
  static async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const session = OrdersController.getRequiredSession(req);

      const order = await OrdersService.placeOrder(
        session.restaurantId,
        session._id,
        session.tableId,
        session.customerName,
        req.body
      );

      void logAuditRaw({
      actorId:      session._id.toString(),
      actorRole:    'CUSTOMER',
      restaurantId: session.restaurantId.toString(),
      entityType:   AuditEntity.ORDER,
      entityId:     order._id.toString(),
      action:       AuditAction.ORDER_PLACED,
      metadata: {
        tableId:     session.tableId,
        customerName: session.customerName,
        itemCount:   order.items?.length ?? 0,
        totalAmount: order.totalAmount,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

      ok(res, { order }, 201);
    } catch (error) {
      next(error);
    }
  }

  // GET /customer/orders
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const session = OrdersController.getRequiredSession(req);

      const data = await OrdersService.getCustomerOrders(session.restaurantId, session._id, {
        status: req.query.status as string | undefined,
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 10),
      });

      ok(res, {
        ...data,
        meta: {
          count: data.orders.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /customer/orders/:id
  static async getSingleOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const session = OrdersController.getRequiredSession(req);

      const { id } = req.params;
      const order = await OrdersService.getCustomerOrderById(session.restaurantId, session._id, id);
      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // POST /customer/orders/:id/reorder
  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const session = OrdersController.getRequiredSession(req);

      const { id } = req.params;
      const order = await OrdersService.reorder(session.restaurantId, session._id, session.tableId, id);

      void logAuditRaw({
      actorId:      session._id.toString(),
      actorRole:    'CUSTOMER',
      restaurantId: session.restaurantId.toString(),
      entityType:   AuditEntity.ORDER,
      entityId:     order._id.toString(),
      action:       AuditAction.ORDER_REORDERED,
      metadata: {
        tableId:         session.tableId,
        originalOrderId: id,           // the order being reordered from
        newOrderId:      order._id.toString(),
        itemCount:       order.items?.length ?? 0,
        totalAmount:     order.totalAmount,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // POST /customer/orders/:id/cancel
  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const session = OrdersController.getRequiredSession(req);

      const { id } = req.params;
      const order = await OrdersService.cancelOrder(session.restaurantId, session._id, id);

      void logAuditRaw({
      actorId:      session._id.toString(),
      actorRole:    'CUSTOMER',
      restaurantId: session.restaurantId.toString(),
      entityType:   AuditEntity.ORDER,
      entityId:     order._id.toString(),
      action:       AuditAction.ORDER_CANCELLED,
      metadata: {
        tableId: session.tableId,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | KITCHEN ORDER APIs (JWT auth — req.user)
  |--------------------------------------------------------------------------
  */

  // GET /kitchen/orders
  static async getKitchenOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);
      const batchFilter = `${req.query.batch ?? ''}` === 'true';

      const orders = await OrdersService.getKitchenOrders(restaurantId, {
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        table: req.query.table as string | undefined,
        batch: batchFilter,
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

  // GET /kitchen/orders/:id
  static async getKitchenOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const order = await OrdersService.getKitchenOrderDetails(restaurantId, id);
      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /kitchen/orders/:id/accept
  static async acceptOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const { estimatedPreparationTime } = req.body;
      const order = await OrdersService.acceptOrder(restaurantId, id, estimatedPreparationTime, req.user?.id);

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /kitchen/orders/:id/start
  static async startCooking(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const order = await OrdersService.startCooking(restaurantId, id, req.user?.id);


      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /kitchen/orders/:id/ready
  static async markReady(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const order = await OrdersService.markReady(restaurantId, id, req.user?.id);


      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /kitchen/orders/:id/delay
  static async delayOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const { delayMinutes } = req.body;
      const order = await OrdersService.delayOrder(restaurantId, id, delayMinutes, req.user?.id);



      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /kitchen/orders/:id/reject
  static async rejectOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const { reason } = req.body;
      const order = await OrdersService.rejectOrder(restaurantId, id, reason, req.user?.id);

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SERVICE STAFF ORDER APIs (JWT auth — req.user)
  |--------------------------------------------------------------------------
  */

  // GET /staff/orders/ready
  static async getReadyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const orders = await OrdersService.getReadyOrders(restaurantId);
      ok(res, {
        orders,
        meta: {
          count: orders.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /staff/orders/:id/pick
  static async pickFood(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const order = await OrdersService.pickFood(restaurantId, id, req.user?.id);

      void logAudit(req, {
      entityType: AuditEntity.ORDER,
      entityId:   order._id.toString(),
      action:     AuditAction.ORDER_PICKED,
      metadata: {
        pickedBy: req.user?.id,
        tableId:  order.tableId,
      },
    });


      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /staff/orders/:id/serve
  static async markServed(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const order = await OrdersService.markServed(restaurantId, id, req.user?.id);

      void logAudit(req, {
      entityType: AuditEntity.ORDER,
      entityId:   order._id.toString(),
      action:     AuditAction.ORDER_SERVED,
      metadata: {
        servedBy: req.user?.id,
        tableId:  order.tableId,
      },
    });

      ok(res, { order });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /staff/orders/:id/complete
  static async markCompleted(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = OrdersController.getRequiredRestaurantId(req);

      const { id } = req.params;
      const order = await OrdersService.markCompleted(
      restaurantId,
      id,
      req.user?.id,
    );
// Credit loyalty points automatically
await LoyaltyService.creditPoints(order);

void logAudit(req, {
      entityType: AuditEntity.ORDER,
      entityId:   order._id.toString(),
      action:     AuditAction.ORDER_COMPLETED,
      metadata: {
        completedBy:  req.user?.id,
        tableId:      order.tableId,
        totalAmount:  order.totalAmount,
      },
    });

      ok(res, { order });
    } catch (error) {
      next(error);
    }

  }
}
