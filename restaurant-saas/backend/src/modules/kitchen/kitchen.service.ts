import { Types } from 'mongoose';
import { BatchStatus } from '../../constants/statuses';
import { ErrorCode } from '../../constants/errors';
import { UserRole } from '../../constants/roles';
import { AppError } from '../../utils/AppError';
import { IKitchenBatch, KitchenBatchModel } from './kitchen.model';
import { OrderModel } from '../orders/orders.model';
import { OrderStatus } from '../orders/orders.schema';
import { OrdersService } from '../orders/orders.service';
import { UserModel } from '../users/users.model';

type KitchenOrdersFilters = {
  status?: OrderStatus;
  priority?: string;
  table?: string;
  batch?: boolean;
};

type CreateKitchenBatchInput = {
  name: string;
  orderIds: string[];
  station: string;
};

type UpdateKitchenBatchInput = {
  name?: string;
  status?: BatchStatus;
  station?: string;
};

function ensureFound<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new AppError(message, 404, ErrorCode.NOT_FOUND);
  }

  return value;
}

export class KitchenService {
  static async getDashboard(restaurantId: string | Types.ObjectId) {
    const [activeOrders, readyOrders, activeBatches, preparingOrders] = await Promise.all([
      OrderModel.countDocuments({
        restaurantId,
        status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
      }),
      OrderModel.countDocuments({ restaurantId, status: OrderStatus.READY }),
      KitchenBatchModel.countDocuments({ restaurantId, status: BatchStatus.IN_PROGRESS }),
      OrderModel.find({
        restaurantId,
        estimatedPreparationTime: { $ne: null },
      }).select('estimatedPreparationTime'),
    ]);

    const avgEtaMinutes =
      preparingOrders.length > 0
        ? Math.round(
            preparingOrders.reduce((sum, order) => sum + Number(order.estimatedPreparationTime ?? 0), 0) /
              preparingOrders.length,
          )
        : 0;

    return {
      activeOrders,
      readyOrders,
      activeBatches,
      avgEtaMinutes,
    };
  }

  static async getOrders(restaurantId: string | Types.ObjectId, filters: KitchenOrdersFilters = {}) {
    return OrdersService.getKitchenOrders(restaurantId, filters);
  }

  static async getOrderDetails(restaurantId: string | Types.ObjectId, orderId: string | Types.ObjectId) {
    return OrdersService.getKitchenOrderDetails(restaurantId, orderId);
  }

  static async getBatches(restaurantId: string | Types.ObjectId) {
    return KitchenBatchModel.find({ restaurantId }).sort({ createdAt: -1 });
  }

  static async getBatchById(
    restaurantId: string | Types.ObjectId,
    batchId: string | Types.ObjectId,
  ): Promise<IKitchenBatch> {
    return ensureFound(
      await KitchenBatchModel.findOne({
        _id: batchId,
        restaurantId,
      }),
      'Kitchen batch not found',
    );
  }

  static async createBatch(restaurantId: string | Types.ObjectId, data: CreateKitchenBatchInput): Promise<IKitchenBatch> {
    const orders = await OrderModel.find({
      _id: { $in: data.orderIds },
      restaurantId,
    }).select('_id');

    if (orders.length !== data.orderIds.length) {
      throw new AppError('One or more orders do not belong to this restaurant', 400, ErrorCode.INVALID_REQUEST);
    }

    const batch = await KitchenBatchModel.create({
      restaurantId,
      name: data.name,
      orderIds: orders.map((order) => order._id),
      status: BatchStatus.IN_PROGRESS,
      station: data.station,
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

    return batch;
  }

  static async updateBatch(
    restaurantId: string | Types.ObjectId,
    batchId: string | Types.ObjectId,
    data: UpdateKitchenBatchInput,
  ): Promise<IKitchenBatch> {
    const update: UpdateKitchenBatchInput = {};

    if (data.name !== undefined) update.name = data.name;
    if (data.status !== undefined) update.status = data.status;
    if (data.station !== undefined) update.station = data.station;

    return ensureFound(
      await KitchenBatchModel.findOneAndUpdate(
        {
          _id: batchId,
          restaurantId,
        },
        update,
        { new: true, runValidators: true },
      ),
      'Kitchen batch not found',
    );
  }

  static async getStationLoad(restaurantId: string | Types.ObjectId) {
    const batches = await KitchenBatchModel.find({ restaurantId }).select('station status');

    return ['Hot Line', 'Cold Pass', 'Dessert'].map((station) => {
      const stationLoad = batches.filter((batch) => batch.station === station).length;
      return {
        station,
        loadPercent: Math.min(100, stationLoad * 30),
      };
    });
  }

  static async getPerformance(restaurantId: string | Types.ObjectId) {
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

    const metrics = new Map<
      string,
      { handledOrders: number; completedKitchenFlow: number; totalMinutes: number; measuredOrders: number }
    >();

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

    return kitchenUsers.map((user) => {
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
        completionRate:
          current.handledOrders > 0 ? Number((current.completedKitchenFlow / current.handledOrders).toFixed(2)) : 0,
      };
    });
  }
}
