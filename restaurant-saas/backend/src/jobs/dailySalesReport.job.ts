import cron from 'node-cron';
import mongoose from 'mongoose';
import { env } from '../config/env';
import logger from '../config/logger';
import { RestaurantModel } from '../modules/restaurants/restaurants.model';
import { UserModel } from '../modules/users/users.model';
import { OrderModel } from '../modules/orders/orders.model';
import { BillingModel } from '../modules/billing/billing.model';
import { sendDailySalesReportEmail } from '../services/mail.service';
import { UserRole } from '../constants/roles';
import { OrderStatus } from '../modules/orders/orders.schema';
import { BillStatus } from '../modules/billing/billing.schema';

// Minimal schema for idempotency
const dailyReportLogSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reportDate: { type: String, required: true }, // Format: YYYY-MM-DD
  sentAt: { type: Date, default: Date.now }
});
dailyReportLogSchema.index({ restaurantId: 1, reportDate: 1 }, { unique: true });

const DailyReportLogModel = mongoose.models.DailyReportLog || mongoose.model('DailyReportLog', dailyReportLogSchema);

// Helper to calculate the previous day's start and end times in Asia/Kolkata (IST)
export function getPreviousDayTimeRange() {
  const offsetMs = 5.5 * 60 * 60 * 1000; // IST is +05:30

  const nowIST = new Date(Date.now() + offsetMs);
  const yesterdayIST = new Date(nowIST.getTime() - 24 * 60 * 60 * 1000);

  const startIST = new Date(yesterdayIST);
  startIST.setUTCHours(0, 0, 0, 0);

  const endIST = new Date(yesterdayIST);
  endIST.setUTCHours(23, 59, 59, 999);

  const startOfDay = new Date(startIST.getTime() - offsetMs);
  const endOfDay = new Date(endIST.getTime() - offsetMs);

  const reportDate = startIST.toISOString().split('T')[0];

  return { startOfDay, endOfDay, reportDate };
}

export async function processDailySalesReports() {
  logger.info('Starting daily sales report generation...');
  const { startOfDay, endOfDay, reportDate } = getPreviousDayTimeRange();

  try {
    const restaurants = await RestaurantModel.find({ isActive: true }).lean();

    for (const restaurant of restaurants) {
      try {
        // Idempotency check: Have we already sent this report today for this restaurant?
        const existingLog = await DailyReportLogModel.findOne({
          restaurantId: restaurant._id,
          reportDate
        }).lean();

        if (existingLog) {
          logger.debug(`Daily sales report already sent for ${restaurant.name} on ${reportDate}`);
          continue;
        }

        // 1. Fetch Revenue and Paid Bills from BillingModel
        const bills = await BillingModel.find({
          restaurantId: restaurant._id,
          status: BillStatus.PAID,
          paidAt: { $gte: startOfDay, $lte: endOfDay }
        }).lean();

        const revenue = bills.reduce((sum, bill) => sum + (bill.finalAmount || 0), 0);
        const paidBills = bills.length;

        // 2. Fetch Total Orders and Cancelled Orders
        const orders = await OrderModel.find({
          restaurantId: restaurant._id,
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).lean();

        const totalOrders = orders.length;
        const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED).length;

        // 3. Average Order Value
        const averageOrderValue = paidBills > 0 ? revenue / paidBills : 0;

        // 4. Top Selling Items
        const itemSales: Record<string, number> = {};
        orders.forEach(order => {
          if (order.status !== OrderStatus.CANCELLED && order.items) {
            order.items.forEach(item => {
              if (item.name) {
                itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
              }
            });
          }
        });

        const topSellingItems = Object.entries(itemSales)
          .map(([name, quantity]) => ({ name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        // Fetch Restaurant Admins
        const admins = await UserModel.find({
          restaurantId: restaurant._id,
          role: UserRole.RESTAURANT_ADMIN,
          isDeleted: false
        }).lean();

        if (admins.length === 0) {
          logger.warn(`No active RESTAURANT_ADMIN found for ${restaurant.name}, skipping email dispatch.`);
          continue;
        }

        // Send Email
        let emailsSent = 0;
        for (const admin of admins) {
          if (!admin.email || admin.email.includes('@placeholder.com')) continue;

          const success = await sendDailySalesReportEmail(
            admin.email,
            restaurant.name,
            reportDate,
            totalOrders,
            revenue,
            paidBills,
            cancelledOrders,
            averageOrderValue,
            topSellingItems
          );

          if (success) emailsSent++;
        }

        // Record Idempotency Log
        if (emailsSent > 0) {
          await DailyReportLogModel.create({
            restaurantId: restaurant._id,
            reportDate
          });
          logger.info(`Successfully generated and sent daily sales report for ${restaurant.name} (${emailsSent} admins)`);
        } else {
          logger.warn(`Failed to send daily sales report emails for ${restaurant.name}`);
        }

      } catch (error) {
        // Log and continue to the next restaurant
        logger.error(`Failed to process daily sales report for restaurant ${restaurant.name}`, { error });
      }
    }
  } catch (error) {
    logger.error('Critical failure in processDailySalesReports job', { error });
  }
}

export function startDailySalesReportJob() {
  if (!env.CRON_SALES_REPORT_ENABLED) {
    logger.info('Daily sales report cron job is disabled via environment variables.');
    return;
  }

  cron.schedule(env.CRON_SALES_REPORT_TIME, () => {
    logger.info('Cron triggered: processDailySalesReports');
    void processDailySalesReports();
  }, {
    timezone: "Asia/Kolkata"
  });

  logger.info(`Daily sales report cron job scheduled with time: ${env.CRON_SALES_REPORT_TIME} (Asia/Kolkata)`);
}