import cron from 'node-cron';
import logger from '../config/logger';
import { OrderModel } from '../modules/orders/orders.model';
import { OfferModel } from '../modules/offers/offers.model';
import { QueueEntryModel } from '../modules/queue/queue.model';
import { ReservationModel } from '../modules/reservations/reservations.model';
import { SubscriptionModel, SubscriptionStatus } from '../modules/subscriptions/subscriptions.model';
import { TableModel } from '../modules/tables/tables.model';
import { InventoryItemModel } from '../modules/inventory/inventory.model';
import { UserModel } from '../modules/users/users.model';
import { STAFF_ROLES } from '../constants/roles';
import { withLock } from '../utils/cronLock';

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function aggregateSubscriptionUsage() {
  const subscriptions = await SubscriptionModel.find({ status: SubscriptionStatus.ACTIVE });
  const now = new Date();
  const today = startOfDay(now);
  const month = startOfMonth(now);

  for (const subscription of subscriptions) {
    const restaurantId = subscription.restaurantId;
    const [
      totalOrders,
      dailyOrderCount,
      monthlyOrderCount,
      activeTables,
      queueUsage,
      reservationActivity,
      discountUsage,
      inventoryCount,
      staffCount,
    ] = await Promise.all([
      OrderModel.countDocuments({ restaurantId }),
      OrderModel.countDocuments({ restaurantId, createdAt: { $gte: today } }),
      OrderModel.countDocuments({ restaurantId, createdAt: { $gte: month } }),
      TableModel.countDocuments({ restaurantId, isActive: true }),
      QueueEntryModel.countDocuments({ restaurantId }),
      ReservationModel.countDocuments({ restaurantId }),
      OfferModel.countDocuments({ restaurantId }),
      InventoryItemModel.countDocuments({ restaurantId, active: { $ne: false } }),
      UserModel.countDocuments({ restaurantId, role: { $in: STAFF_ROLES } }),
    ]);

    subscription.activeTables = activeTables;
    subscription.dailyOrderCount = dailyOrderCount;
    subscription.monthlyOrderCount = monthlyOrderCount;
    subscription.usageCount = totalOrders;
    subscription.usage = {
      ...(subscription.usage ?? {}),
      totalOrders,
      dailyOrderCount,
      monthlyOrderCount,
      activeTables,
      queueUsage,
      reservationActivity,
      discountUsage,
      customerTraffic: totalOrders,
      analyticsUsage: subscription.usage?.analyticsUsage ?? 0,
      inventoryCount,
      staffCount,
    };

    await subscription.save();
  }

  return { processed: subscriptions.length };
}

export function startSubscriptionUsageAggregationJob() {
  // TODO: Migrate to BullMQ for robust queueing
  // Runs every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.info('Starting subscription usage aggregation job...');
    try {
      await withLock('subscription-usage-aggregation', 15 * 60, async () => {
        await aggregateSubscriptionUsage();
      });
      logger.info('Finished subscription usage aggregation job.');
    } catch (error) {
      logger.error('Error during subscription usage aggregation job:', error);
    }
  });
}
