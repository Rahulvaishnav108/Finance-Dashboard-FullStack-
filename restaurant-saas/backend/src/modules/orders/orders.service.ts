import { Types } from 'mongoose';
import { OrderModel } from './orders.model';
import { Cart } from '../cart/cart.model';
import { PlaceOrderInput, OrderStatus, PaymentStatus } from './orders.schema';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { Priority, SessionStatus, TableStatus } from '../../constants/statuses';
import { TableModel } from '../tables/tables.model';
import mongoose from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '../../constants/roles';
import { NotificationCategory, NotificationPriority } from '../notifications/notifications.schema';
import { TableSessionModel } from '../tableSessions/tableSessions.model';
import { socketService } from '../../sockets/socket.service';
import { SocketEvent } from '../../constants/events';
import { creditPoints } from '../loyalty/loyalty.service';
import { InventoryService } from '../inventory/inventory.service';
import { assertPlanLimit, recordSubscriptionUsage } from '../subscriptions/subscriptionEnforcement.service';

const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.REJECTED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.DELAYED, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.DELAYED],
  [OrderStatus.DELAYED]: [OrderStatus.READY, OrderStatus.PREPARING],
  [OrderStatus.READY]: [OrderStatus.PICKED, OrderStatus.SERVED],
  [OrderStatus.PICKED]: [OrderStatus.SERVED],
  [OrderStatus.SERVED]: [OrderStatus.BILLED, OrderStatus.COMPLETED],
  [OrderStatus.BILLED]: [OrderStatus.PAID, OrderStatus.CONFIRMED],
  [OrderStatus.PAID]: [OrderStatus.COMPLETED, OrderStatus.CONFIRMED],
};

function ensureOrderTransition(currentStatus: OrderStatus, nextStatus: OrderStatus, message: string): void {
  const allowed = ORDER_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(message, 400, ErrorCode.ORDER_NOT_MODIFIABLE);
  }
}

function toNullableObjectId(value?: string | Types.ObjectId | null): Types.ObjectId | null {
  if (!value) {
    return null;
  }

  return typeof value === 'string' ? new mongoose.Types.ObjectId(value) : value;
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function enforceOrderLimits(restaurantId: string | Types.ObjectId) {
  const now = new Date();
  const [dailyOrders, monthlyOrders] = await Promise.all([
    OrderModel.countDocuments({ restaurantId, createdAt: { $gte: startOfDay(now) } }),
    OrderModel.countDocuments({ restaurantId, createdAt: { $gte: startOfMonth(now) } }),
  ]);

  await assertPlanLimit(restaurantId, 'dailyOrderLimit', dailyOrders + 1, 'daily orders');
  await assertPlanLimit(restaurantId, 'monthlyOrderLimit', monthlyOrders + 1, 'monthly orders');

  return { dailyOrderCount: dailyOrders + 1, monthlyOrderCount: monthlyOrders + 1 };
}

export class OrdersService {
  static async placeOrder(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId,
    tableId: string | Types.ObjectId,
    _customerName: string | undefined,
    data: PlaceOrderInput
  ) {
    const orderUsage = await enforceOrderLimits(restaurantId);
    const sessionObjectId = typeof sessionId === 'string' ? new mongoose.Types.ObjectId(sessionId) : sessionId;

    // 1. Acquire atomic order lock on session
    const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000);
    const lockedSession = await TableSessionModel.findOneAndUpdate(
      {
        _id: sessionObjectId,
        status: SessionStatus.ACTIVE,
        $or: [
          { isOrdering: false },
          { isOrdering: { $exists: false } },
          { isOrdering: true, lastOrderAttemptAt: { $lt: fifteenSecondsAgo } },
        ],
      },
      {
        $set: {
          isOrdering: true,
          lastOrderAttemptAt: new Date(),
        },
      },
      { new: true }
    );

    if (!lockedSession) {
      throw new AppError(
        'Parallel order creation in progress. Please wait.',
        409,
        ErrorCode.DUPLICATE_ORDER_ATTEMPT
      );
    }

    try {
      // 2. Fetch Cart
      const cart = await Cart.findOne({ restaurantId, sessionId });

      if (!cart) {
        throw new AppError('Cart not found', 404, ErrorCode.NOT_FOUND);
      }

      if (!cart.items || cart.items.length === 0) {
        throw new AppError('Cannot place order with an empty cart', 400, ErrorCode.VALIDATION_ERROR);
      }

      // 2.5 Explicitly fetch MenuItems to bypass Mongoose populate caching issues
      const menuItemIds = cart.items.map(i => i.menuItem);
      const menuItems = await mongoose.model('MenuItem').find({
        _id: { $in: menuItemIds },
        restaurantId
      }).populate('ingredients.inventoryItemId');

      const menuItemMap = new Map(menuItems.map(m => [m._id.toString(), m]));

      // 3. Map CartItems to OrderItems
      const orderItems = cart.items.map((item: any) => {
        const menuItemIdStr = item.menuItem.toString();
        const fullMenuItem = menuItemMap.get(menuItemIdStr);

        if (!fullMenuItem) {
          throw new AppError('Invalid menu item in cart', 400, ErrorCode.VALIDATION_ERROR);
        }

        const ingredientsSnapshot = fullMenuItem.ingredients ? fullMenuItem.ingredients.map((ing: any) => ({
          inventoryItemId: ing.inventoryItemId && ing.inventoryItemId._id ? ing.inventoryItemId._id : ing.inventoryItemId,
          inventoryItemName: (ing.inventoryItemId && ing.inventoryItemId.name) || 'Unknown Item',
          quantity: ing.quantity
        })) : [];

        return {
          menuItemId: fullMenuItem._id,
          name: fullMenuItem.name,
          quantity: item.quantity,
          price: item.unitPrice,
          totalPrice: item.subtotal,
          notes: item.notes || '',
          ingredients: ingredientsSnapshot,
        };
      });

      // 4. Generate Order Number
      const timestamp = Date.now().toString().slice(-6);
      const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${randomChars}`;

      // 5. Create Order
      const order = await OrderModel.create({
        restaurantId,
        tableId,
        sessionId,
        orderNumber,
        items: orderItems,
        totalAmount: cart.subtotal,
        taxAmount: cart.tax,
        discountAmount: cart.discount,
        finalAmount: cart.grandTotal,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        priority: Priority.NORMAL,
        specialInstructions: data.specialInstructions || '',
      });

      await Promise.all([
        recordSubscriptionUsage(restaurantId, 'dailyOrderCount', orderUsage.dailyOrderCount),
        recordSubscriptionUsage(restaurantId, 'monthlyOrderCount', orderUsage.monthlyOrderCount),
      ]);

      // Transition table status to ORDERING if it is currently OCCUPIED
      const table = await TableModel.findById(tableId);
      if (table && table.status === TableStatus.OCCUPIED) {
        table.status = TableStatus.ORDERING;
        await table.save();
      }

      // 6. Clear Cart
      cart.items = [] as any;
      cart.subtotal = 0;
      cart.tax = 0;
      cart.discount = 0;
      cart.grandTotal = 0;
      await cart.save();

      // 7. Emit Realtime Event for Kitchen
      socketService.emitToRestaurant(restaurantId.toString(), SocketEvent.ORDER_NEW, { orderId: order._id });

      return order;
    } finally {
      // 8. Always release the lock
      await TableSessionModel.findByIdAndUpdate(sessionObjectId, {
        $set: { isOrdering: false },
      });
    }
  }

  static async getCustomerOrders(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId,
    options: { status?: string; page?: number; limit?: number } = {},
  ) {
    const page = Number(options.page ?? 1);
    const limit = Number(options.limit ?? 10);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { restaurantId, sessionId };
    if (options.status) {
      query.status = options.status;
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  static async getCustomerOrderById(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
  ) {
    const order = await OrderModel.findOne({ _id: orderId, restaurantId, sessionId });
    if (!order) {
      throw new AppError('Order not found', 404, ErrorCode.NOT_FOUND);
    }

    return order;
  }

  static async reorder(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId,
    tableId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
  ) {
    const original = await this.getCustomerOrderById(restaurantId, sessionId, orderId);

    if (original.status === OrderStatus.CANCELLED || original.status === OrderStatus.REJECTED) {
      throw new AppError('Cancelled or rejected orders cannot be reordered', 400, ErrorCode.ORDER_NOT_MODIFIABLE);
    }

    const timestamp = Date.now().toString().slice(-6);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${randomChars}`;
    const orderUsage = await enforceOrderLimits(restaurantId);

    const order = await OrderModel.create({
      restaurantId,
      tableId,
      sessionId,
      orderNumber,
      items: original.items,
      totalAmount: original.totalAmount,
      taxAmount: original.taxAmount,
      discountAmount: original.discountAmount,
      finalAmount: original.finalAmount,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      priority: original.priority ?? Priority.NORMAL,
      specialInstructions: original.specialInstructions,
    });

    await Promise.all([
      recordSubscriptionUsage(restaurantId, 'dailyOrderCount', orderUsage.dailyOrderCount),
      recordSubscriptionUsage(restaurantId, 'monthlyOrderCount', orderUsage.monthlyOrderCount),
    ]);

    const table = await TableModel.findById(tableId);
    if (table && table.status === TableStatus.OCCUPIED) {
      table.status = TableStatus.ORDERING;
      await table.save();
    }

    return order;
  }

  static async cancelOrder(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
  ) {
    const order = await this.getCustomerOrderById(restaurantId, sessionId, orderId);

    ensureOrderTransition(order.status as OrderStatus, OrderStatus.CANCELLED, 'Order cannot be cancelled in its current state');

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();

    if (order.stockDeducted) {
      await InventoryService.restoreStock(restaurantId, order.items);
      order.stockDeducted = false;
    }

    await order.save();

    return order;
  }

  // --- Kitchen Order APIs ---

  static async getKitchenOrders(
    restaurantId: string | Types.ObjectId,
    options: {
      status?: string;
      priority?: string;
      table?: string;
      batch?: boolean;
    } = {}
  ) {
    const query: Record<string, unknown> = {
      restaurantId,
      status: options.status
        ? options.status
        : {
            $in: [
              OrderStatus.PENDING,
              OrderStatus.CONFIRMED,
              OrderStatus.PREPARING,
              OrderStatus.READY,
            ],
          },
    };

    if (options.priority) {
      query.priority = options.priority;
    }

    if (options.batch) {
      query.batchId = { $ne: null };
    }

    if (options.table) {
      if (Types.ObjectId.isValid(options.table)) {
        query.tableId = new Types.ObjectId(options.table);
      } else {
        const tableIds = await TableModel.find({
          restaurantId,
          tableNumber: options.table,
        }).distinct('_id');
        query.tableId = tableIds.length > 0 ? { $in: tableIds } : null;
      }
    }

    return OrderModel.find(query).sort({ createdAt: 1 });
  }

  static async getKitchenOrderDetails(restaurantId: string | Types.ObjectId, orderId: string | Types.ObjectId) {
    const order = await OrderModel.findOne({ _id: orderId, restaurantId }).populate('items.menuItemId');
    if (!order) {
      throw new AppError('Order not found', 404, ErrorCode.NOT_FOUND);
    }
    return order;
  }

  static async acceptOrder(
    restaurantId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    estimatedTime?: number,
    actorId?: string | Types.ObjectId | null,
  ) {
    const order = await this.getKitchenOrderDetails(restaurantId, orderId);

    ensureOrderTransition(order.status as OrderStatus, OrderStatus.CONFIRMED, 'Only pending orders can be accepted');

    order.status = OrderStatus.CONFIRMED;
    order.acceptedAt = new Date();
    order.kitchenStaffId = toNullableObjectId(actorId);
    if (estimatedTime) {
      order.estimatedPreparationTime = estimatedTime;
    }

    await order.save();

    // Trigger persistent notification targeting CUSTOMER
    await NotificationsService.createNotification({
      restaurantId: order.restaurantId,
      tableSessionId: order.sessionId,
      recipientRole: UserRole.CUSTOMER,
      title: 'Order Confirmed',
      message: `Your order ${order.orderNumber} has been confirmed.`,
      type: 'ORDER_CONFIRMED',
      category: NotificationCategory.SYSTEM,
      priority: NotificationPriority.NORMAL,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return order;
  }

  static async startCooking(
    restaurantId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    actorId?: string | Types.ObjectId | null,
  ) {
    const order = await this.getKitchenOrderDetails(restaurantId, orderId);

    ensureOrderTransition(order.status as OrderStatus, OrderStatus.PREPARING, 'Order cannot be prepared from current status');

    order.status = OrderStatus.PREPARING;
    order.preparingStartedAt = new Date();
    order.kitchenStaffId = toNullableObjectId(actorId);

    if (!order.stockDeducted) {
      await InventoryService.deductStock(restaurantId, order.items, order._id, actorId || undefined);
      order.stockDeducted = true;
    }

    await order.save();
    return order;
  }

  static async markReady(
    restaurantId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    actorId?: string | Types.ObjectId | null,
  ) {
    const order = await this.getKitchenOrderDetails(restaurantId, orderId);

    ensureOrderTransition(order.status as OrderStatus, OrderStatus.READY, 'Only preparing orders can be marked ready');

    order.status = OrderStatus.READY;
    order.readyAt = new Date();
    order.kitchenStaffId = toNullableObjectId(actorId);
    await order.save();

    // Trigger persistent notification targeting SERVICE_STAFF
    await NotificationsService.createNotification({
      restaurantId: order.restaurantId,
      tableSessionId: order.sessionId,
      recipientRole: UserRole.SERVICE_STAFF,
      title: 'Order Ready for Pickup',
      message: `Order ${order.orderNumber} is ready to be served.`,
      type: 'ORDER_READY',
      category: NotificationCategory.STAFF,
      priority: NotificationPriority.HIGH,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return order;
  }

  static async rejectOrder(
    restaurantId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    reason: string,
    actorId?: string | Types.ObjectId | null,
  ) {
    const order = await this.getKitchenOrderDetails(restaurantId, orderId);

    ensureOrderTransition(order.status as OrderStatus, OrderStatus.REJECTED, 'Only pending orders can be rejected');

    order.status = OrderStatus.REJECTED;
    order.cancelledAt = new Date();
    order.rejectedAt = new Date();
    order.kitchenStaffId = toNullableObjectId(actorId);
    order.rejectionReason = reason;

    if (order.stockDeducted) {
      await InventoryService.restoreStock(restaurantId, order.items, order._id, actorId || undefined);
      order.stockDeducted = false;
    }

    await order.save();
    return order;
  }

  static async delayOrder(
    restaurantId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    delayMinutes: number,
    actorId?: string | Types.ObjectId | null,
  ) {
    const order = await this.getKitchenOrderDetails(restaurantId, orderId);

    ensureOrderTransition(order.status as OrderStatus, OrderStatus.DELAYED, 'Cannot delay order in current status');

    order.status = OrderStatus.DELAYED;
    if (order.estimatedPreparationTime) {
      order.estimatedPreparationTime += delayMinutes;
    } else {
      order.estimatedPreparationTime = delayMinutes;
    }
    order.delayedAt = new Date();
    order.kitchenStaffId = toNullableObjectId(actorId);

    await order.save();
    return order;
  }

  static async getReadyOrders(restaurantId: string | Types.ObjectId) {
    return OrderModel.find({ restaurantId, status: OrderStatus.READY }).sort({ updatedAt: 1 });
  }

  static async pickFood(
    restaurantId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    actorId?: string | Types.ObjectId | null,
  ) {
    const order = await this.getKitchenOrderDetails(restaurantId, orderId);

    ensureOrderTransition(order.status as OrderStatus, OrderStatus.PICKED, 'Only ready orders can be picked');

    order.status = OrderStatus.PICKED;
    order.pickedAt = new Date();
    order.serviceStaffId = toNullableObjectId(actorId);
    await order.save();
    return order;
  }

  static async markServed(
    restaurantId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    actorId?: string | Types.ObjectId | null,
  ) {
    const order = await this.getKitchenOrderDetails(restaurantId, orderId);

    // Only ready orders can transition to served (since PICKED is retired as a status)
    ensureOrderTransition(order.status as OrderStatus, OrderStatus.SERVED, 'Only ready orders can be served');

    order.status = OrderStatus.SERVED;
    order.servedAt = new Date();
    order.serviceStaffId = toNullableObjectId(actorId);
    await order.save();
    return order;
  }

  static async markCompleted(
    restaurantId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    actorId?: string | Types.ObjectId | null,
  ) {
    const order = await this.getKitchenOrderDetails(restaurantId, orderId);

    ensureOrderTransition(order.status as OrderStatus, OrderStatus.COMPLETED, 'Only paid orders can be completed');

    order.status = OrderStatus.COMPLETED;
    order.completedAt = new Date();
    order.serviceStaffId = toNullableObjectId(actorId);
    await order.save();
    await creditPoints(order);
    return order;
  }
}
