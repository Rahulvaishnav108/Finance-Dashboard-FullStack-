import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { ok } from '../../utils/responses';
import { KitchenBatchModel } from '../kitchen/kitchen.model';
import { OrderModel } from '../orders/orders.model';
import { BatchStatus } from '../../constants/statuses';
import { OrderStatus } from '../orders/orders.schema';
import { UserModel } from '../users/users.model';
import { UserRole, KitchenRole } from '../../constants/roles';
import { requireKitchenRole } from '../../middleware/requireAuth';
import {
  createKitchenBatchBodySchema,
  kitchenBatchParamsSchema,
  updateKitchenBatchBodySchema,
  kitchenOrdersQuerySchema,
} from '../kitchen/kitchen.schema';
import { OrdersController } from '../orders/orders.controller';
import {
  orderIdParamsSchema,
  acceptOrderBodySchema,
  rejectOrderBodySchema,
  delayOrderBodySchema,
} from '../orders/orders.schema';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { inventoryQuerySchema } from '../inventory/inventory.schema';
import { listInventoryController, getInventoryAlertsController } from '../inventory/inventory.controller';

export const kitchenRouter = Router();

function ensureFound<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new AppError(message, 404, ErrorCode.NOT_FOUND);
  }

  return value;
}

kitchenRouter.get('/dashboard', async (req, res, next) => {
  try {
    const restaurantId = req.user?.restaurantId;

    const [activeOrders, readyOrders, activeBatches] = await Promise.all([
      OrderModel.countDocuments({
        restaurantId,
        status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
      }),
      OrderModel.countDocuments({ restaurantId, status: OrderStatus.READY }),
      KitchenBatchModel.countDocuments({ restaurantId, status: BatchStatus.IN_PROGRESS }),
    ]);

    const preparingOrders = await OrderModel.find({
      restaurantId,
      estimatedPreparationTime: { $ne: null },
    }).select('estimatedPreparationTime');

    const avgEtaMinutes =
      preparingOrders.length > 0
        ? Math.round(
            preparingOrders.reduce((sum, order) => sum + Number(order.estimatedPreparationTime ?? 0), 0) /
              preparingOrders.length,
          )
        : 0;

    ok(res, {
      metrics: {
        activeOrders,
        readyOrders,
        activeBatches,
        avgEtaMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
});

kitchenRouter.get('/batches', async (req, res, next) => {
  try {
    const batches = await KitchenBatchModel.find({
      restaurantId: req.user?.restaurantId,
    }).sort({ createdAt: -1 });

    ok(res, {
      batches,
      meta: {
        count: batches.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

kitchenRouter.get('/batches/:id', validate({ params: kitchenBatchParamsSchema }), async (req, res, next) => {
  try {
    const batch = ensureFound(
      await KitchenBatchModel.findOne({
        _id: req.params.id,
        restaurantId: req.user?.restaurantId,
      }),
      'Kitchen batch not found',
    );

    ok(res, { batch });
  } catch (error) {
    next(error);
  }
});

kitchenRouter.post('/batches', validate({ body: createKitchenBatchBodySchema }), async (req, res, next) => {
  try {
    const restaurantId = req.user?.restaurantId;
    const orders = await OrderModel.find({
      _id: { $in: req.body.orderIds },
      restaurantId,
    }).select('_id');

    if (orders.length !== req.body.orderIds.length) {
      throw new AppError('One or more orders do not belong to this restaurant', 400, ErrorCode.INVALID_REQUEST);
    }

    const batch = await KitchenBatchModel.create({
      restaurantId,
      name: req.body.name,
      orderIds: orders.map((order) => order._id),
      status: BatchStatus.IN_PROGRESS,
      station: req.body.station,
    });

    await OrderModel.updateMany(
      {
        _id: { $in: batch.orderIds },
        restaurantId,
      },
      {
        batchId: batch._id,
      },
    );

    ok(res, { batch }, 201);
  } catch (error) {
    next(error);
  }
});

kitchenRouter.patch(
  '/batches/:id',
  validate({ params: kitchenBatchParamsSchema, body: updateKitchenBatchBodySchema }),
  async (req, res, next) => {
  try {
    const batch = ensureFound(
      await KitchenBatchModel.findOneAndUpdate(
        {
          _id: req.params.id,
          restaurantId: req.user?.restaurantId,
        },
        {
          name: req.body.name,
          status: req.body.status,
          station: req.body.station,
        },
        { new: true, runValidators: true },
      ),
      'Kitchen batch not found',
    );

    ok(res, { batch });
  } catch (error) {
    next(error);
  }
});

kitchenRouter.get('/load', requireKitchenRole([KitchenRole.HEAD_CHEF, KitchenRole.KITCHEN_SUPERVISOR]), async (req, res, next) => {
  try {
    const batches = await KitchenBatchModel.find({
      restaurantId: req.user?.restaurantId,
    }).select('station status');

    const stations = ['Hot Line', 'Cold Pass', 'Dessert'].map((station) => {
      const stationLoad = batches.filter((batch) => batch.station === station).length;
      return {
        station,
        loadPercent: Math.min(100, stationLoad * 30),
      };
    });

    ok(res, {
      stations,
      meta: {
        count: stations.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

kitchenRouter.get('/performance', requireKitchenRole([KitchenRole.HEAD_CHEF, KitchenRole.KITCHEN_SUPERVISOR]), async (req, res, next) => {
  try {
    const restaurantId = req.user?.restaurantId;
    const [kitchenUsers, handledOrders] = await Promise.all([
      UserModel.find({
        restaurantId,
        role: { $in: [UserRole.KITCHEN_STAFF, UserRole.RESTAURANT_ADMIN] },
      })
        .select('name role')
        .lean(),
      OrderModel.find({
        restaurantId,
        kitchenStaffId: { $ne: null },
      })
        .select('kitchenStaffId status acceptedAt readyAt rejectedAt')
        .lean(),
    ]);

    const metrics = new Map<string, { handledOrders: number; completedKitchenFlow: number; totalMinutes: number; measuredOrders: number }>();

    handledOrders.forEach((order) => {
      const staffId = order.kitchenStaffId ? String(order.kitchenStaffId) : null;
      if (!staffId) {
        return;
      }

      const current = metrics.get(staffId) ?? {
        handledOrders: 0,
        completedKitchenFlow: 0,
        totalMinutes: 0,
        measuredOrders: 0,
      };

      current.handledOrders += 1;

      if (
        [OrderStatus.READY, OrderStatus.SERVED, OrderStatus.COMPLETED, OrderStatus.REJECTED].includes(
          order.status as OrderStatus,
        )
      ) {
        current.completedKitchenFlow += 1;
      }

      const finishedAt = order.readyAt ?? order.rejectedAt ?? null;
      if (order.acceptedAt && finishedAt) {
        const durationMinutes = Math.max(
          0,
          Math.round((new Date(finishedAt).getTime() - new Date(order.acceptedAt).getTime()) / 60000),
        );
        current.totalMinutes += durationMinutes;
        current.measuredOrders += 1;
      }

      metrics.set(staffId, current);
    });

    const chefs = kitchenUsers.map((user) => {
      const current = metrics.get(String(user._id)) ?? {
        handledOrders: 0,
        completedKitchenFlow: 0,
        totalMinutes: 0,
        measuredOrders: 0,
      };

      return {
        id: String(user._id),
        name: user.name,
        role: user.role,
        handledOrders: current.handledOrders,
        completedKitchenFlow: current.completedKitchenFlow,
        avgTicketMinutes: current.measuredOrders > 0 ? Math.round(current.totalMinutes / current.measuredOrders) : 0,
        completionRate: current.handledOrders > 0 ? Number((current.completedKitchenFlow / current.handledOrders).toFixed(2)) : 0,
      };
    });

    ok(res, {
      chefs,
      meta: {
        count: chefs.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Kitchen Order Dashboard & Lifecycle Transition endpoints ────────────────────
kitchenRouter.get(
  '/orders',
  validate({ query: kitchenOrdersQuerySchema }),
  OrdersController.getKitchenOrders
);

kitchenRouter.get(
  '/orders/:id',
  validate({ params: orderIdParamsSchema }),
  OrdersController.getKitchenOrderDetails
);

kitchenRouter.patch(
  '/orders/:id/accept',
  validate({ params: orderIdParamsSchema, body: acceptOrderBodySchema }),
  OrdersController.acceptOrder
);

kitchenRouter.patch(
  '/orders/:id/start',
  validate({ params: orderIdParamsSchema }),
  OrdersController.startCooking
);

kitchenRouter.patch(
  '/orders/:id/ready',
  validate({ params: orderIdParamsSchema }),
  OrdersController.markReady
);

kitchenRouter.patch(
  '/orders/:id/delay',
  validate({ params: orderIdParamsSchema, body: delayOrderBodySchema }),
  OrdersController.delayOrder
);

kitchenRouter.patch(
  '/orders/:id/reject',
  validate({ params: orderIdParamsSchema, body: rejectOrderBodySchema }),
  OrdersController.rejectOrder
);

// ── Kitchen Inventory Access (Read-Only) ────────────────────────────────────────
kitchenRouter.get(
  '/inventory',
  validate({ query: inventoryQuerySchema }),
  listInventoryController
);

kitchenRouter.get(
  '/inventory/alerts',
  validate({ query: inventoryQuerySchema }),
  getInventoryAlertsController
);
