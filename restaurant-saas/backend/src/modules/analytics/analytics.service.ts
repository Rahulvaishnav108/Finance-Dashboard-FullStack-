import mongoose from 'mongoose';
import logger from '../../config/logger';
import { BillingModel } from '../billing/billing.model';
import { SubscriptionModel } from '../subscriptions/subscriptions.model';
import { assertFeatureAccess } from '../subscriptions/subscriptionEnforcement.service';
import { PlatformPlanModel } from '../superAdmin/superAdmin.model';
import { BillStatus, PaymentMethod } from '../billing/billing.schema';
import { CustomerProfileModel } from './customerProfile.model';
import { OrderModel } from '../orders/orders.model';
import { TableModel } from '../tables/tables.model';
import { UserModel } from '../users/users.model';
import { UserRole } from '../../constants/roles';
import { NotificationModel } from '../notifications/notifications.model';
import { OrderStatus, TableStatus, UserStatus } from '../../constants/statuses';
import type { AnalyticsQueryInput } from './analytics.schema';

type AnalyticsDateRange = Pick<AnalyticsQueryInput, 'from' | 'to'>;
type RevenueAnalyticsFilters = AnalyticsDateRange & Pick<AnalyticsQueryInput, 'groupBy'>;

type AnalyticsFiltersResponse = {
  from: string | null;
  to: string | null;
  groupBy?: 'day' | 'month';
};

type RevenueSummaryRow = {
  totalRevenue?: number;
  totalTax?: number;
  totalDiscount?: number;
  billCount?: number;
};

type RevenuePeriodRow = RevenueSummaryRow & {
  _id: string;
};

type PaymentReportRow = {
  _id: PaymentMethod | null;
  count: number;
  totalAmount: number;
};

type PeakHourRow = {
  _id: number;
  orderCount: number;
  totalSales: number;
};

type CustomerSummaryRow = {
  totalCustomers: number;
  repeatCustomers: number;
  activeCustomers: number;
};

type KitchenPerformanceAccumulator = {
  delayedOrders: number;
  measuredOrders: number;
  orderCount: number;
  readyOrders: number;
  rejectedOrders: number;
  totalMinutes: number;
  totalSales: number;
};

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toRangeDate(value: string, edge: 'start' | 'end'): Date {
  if (isDateOnly(value)) {
    const suffix = edge === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
    return new Date(`${value}${suffix}`);
  }

  return new Date(value);
}

function toObjectId(value: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(value);
}

function buildDateRangeCondition(filters: AnalyticsDateRange): Record<string, Date> {
  const range: Record<string, Date> = {};

  if (filters.from) {
    range.$gte = toRangeDate(filters.from, 'start');
  }

  if (filters.to) {
    range.$lte = toRangeDate(filters.to, 'end');
  }

  return range;
}

function buildDateRangeMatch(
  field: string,
  filters: AnalyticsDateRange,
  options?: { requireNonNull?: boolean },
): Record<string, unknown> {
  const range = buildDateRangeCondition(filters);
  const fieldMatch: Record<string, unknown> = options?.requireNonNull ? { $ne: null } : {};

  if (range.$gte) {
    fieldMatch.$gte = range.$gte;
  }

  if (range.$lte) {
    fieldMatch.$lte = range.$lte;
  }

  return Object.keys(fieldMatch).length > 0 ? { [field]: fieldMatch } : {};
}

function buildDateRangeExpression(fieldPath: string, filters: AnalyticsDateRange): true | Record<string, unknown> {
  const expressions: Record<string, unknown>[] = [];

  if (filters.from) {
    expressions.push({ $gte: [fieldPath, toRangeDate(filters.from, 'start')] });
  }

  if (filters.to) {
    expressions.push({ $lte: [fieldPath, toRangeDate(filters.to, 'end')] });
  }

  if (expressions.length === 0) {
    return true;
  }

  return expressions.length === 1 ? expressions[0] : { $and: expressions };
}

function buildFiltersResponse(filters: AnalyticsDateRange, groupBy?: 'day' | 'month'): AnalyticsFiltersResponse {
  return {
    from: filters.from ?? null,
    to: filters.to ?? null,
    ...(groupBy ? { groupBy } : {}),
  };
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function summarizeCustomerMetrics(row?: CustomerSummaryRow) {
  const totalCustomers = row?.totalCustomers ?? 0;
  const repeatCustomers = row?.repeatCustomers ?? 0;
  const activeCustomers = row?.activeCustomers ?? 0;

  return {
    activeCustomers,
    repeatCustomersCount: repeatCustomers,
    repeatRatePercent: totalCustomers > 0 ? roundToTwoDecimals((repeatCustomers / totalCustomers) * 100) : 0,
    totalCustomers,
  };
}



function getUsageLimitForPlan(plan: string, plans: Array<{ name: string; usageLimit?: number }>) {
  const planDoc = plans.find((item) => item.name === plan);
  return planDoc?.usageLimit ?? Number.POSITIVE_INFINITY;
}

function buildSubscriptionUsageAnalytics(
  subscriptions: Array<Partial<{ plan?: string; status?: string; usage?: Record<string, number> }>>,
  planDocs: Array<{ name: string; usageLimit?: number }>,
) {
  const planBuckets = new Map<
    string,
    {
      totalSubscriptions: number;
      activeSubscriptions: number;
      subscriptionsAboveLimit: number;
      usageKeyMetrics: Map<
        string,
        {
          totalUsage: number;
          maxUsage: number;
          sampleCount: number;
          aboveLimitCount: number;
          subscriptionCount: number;
        }
      >;
    }
  >();

  for (const subscription of subscriptions) {
    const plan = subscription.plan ?? 'UNKNOWN';
    const usage = subscription.usage ?? {};
    const usageLimit = getUsageLimitForPlan(plan, planDocs);
    const bucket = planBuckets.get(plan) ?? {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      subscriptionsAboveLimit: 0,
      usageKeyMetrics: new Map(),
    };

    bucket.totalSubscriptions += 1;
    if (subscription.status === 'active') {
      bucket.activeSubscriptions += 1;
    }

    let subscriptionExceeded = false;
    Object.entries(usage).forEach(([key, value]) => {
      const current = bucket.usageKeyMetrics.get(key) ?? {
        totalUsage: 0,
        maxUsage: 0,
        sampleCount: 0,
        aboveLimitCount: 0,
        subscriptionCount: 0,
      };

      current.totalUsage += value;
      current.maxUsage = Math.max(current.maxUsage, value);
      current.sampleCount += 1;
      current.subscriptionCount += 1;
      if (value > usageLimit) {
        current.aboveLimitCount += 1;
        subscriptionExceeded = true;
      }
      bucket.usageKeyMetrics.set(key, current);
    });

    if (subscriptionExceeded) {
      bucket.subscriptionsAboveLimit += 1;
    }

    planBuckets.set(plan, bucket);
  }

  return Array.from(planBuckets.entries()).map(([plan, bucket]) => {
    const usageLimit = getUsageLimitForPlan(plan, planDocs);
    const usageMetrics = Array.from(bucket.usageKeyMetrics.entries()).map(([key, metrics]) => ({
      key,
      totalUsage: metrics.totalUsage,
      averageUsage: metrics.sampleCount > 0 ? roundToTwoDecimals(metrics.totalUsage / metrics.sampleCount) : 0,
      peakUsage: metrics.maxUsage,
      subscriptionsReporting: metrics.subscriptionCount,
      subscriptionsAboveLimit: metrics.aboveLimitCount,
      usageLimit,
      averagePercentUsed:
        usageLimit > 0 ? roundToTwoDecimals((metrics.totalUsage / metrics.sampleCount / usageLimit) * 100) : 0,
    }));

    return {
      plan,
      totalSubscriptions: bucket.totalSubscriptions,
      activeSubscriptions: bucket.activeSubscriptions,
      subscriptionsAboveLimit: bucket.subscriptionsAboveLimit,
      usageMetrics,
    };
  });
}

export class AnalyticsService {
  static async getAdminOverview(restaurantId: string, filters: AnalyticsDateRange) {
    await assertFeatureAccess(restaurantId, 'advancedAnalytics', 'Advanced Analytics');
    const restaurantObjectId = toObjectId(restaurantId);
    const paidBillMatch = {
      restaurantId: restaurantObjectId,
      status: BillStatus.PAID,
      ...buildDateRangeMatch('paidAt', filters, { requireNonNull: true }),
    };

    const activeCustomerExpression = buildDateRangeExpression('$lastVisitAt', filters);

    const [summaryRows, paymentReportRows, customerSummaryRows] = await Promise.all([
      BillingModel.aggregate<RevenueSummaryRow>([
        { $match: paidBillMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalAmount' },
            totalTax: { $sum: '$taxAmount' },
            totalDiscount: { $sum: '$discountAmount' },
            billCount: { $sum: 1 },
          },
        },
      ]),
      BillingModel.aggregate<PaymentReportRow>([
        { $match: paidBillMatch },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            totalAmount: { $sum: '$finalAmount' },
          },
        },
        { $sort: { totalAmount: -1, _id: 1 } },
      ]),
      CustomerProfileModel.aggregate<CustomerSummaryRow>([
        { $match: { restaurantsVisited: restaurantObjectId } },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            repeatCustomers: {
              $sum: {
                $cond: [{ $gt: ['$totalVisits', 1] }, 1, 0],
              },
            },
            activeCustomers: {
              $sum: {
                $cond: [activeCustomerExpression, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const summary = summaryRows[0] ?? {
      billCount: 0,
      totalDiscount: 0,
      totalRevenue: 0,
      totalTax: 0,
    };
    const metrics = summarizeCustomerMetrics(customerSummaryRows[0]);

    return {
      revenue: summary.totalRevenue ?? 0,
      tax: summary.totalTax ?? 0,
      discounts: summary.totalDiscount ?? 0,
      paymentReport: paymentReportRows.map((row) => ({
        count: row.count,
        paymentMethod: row._id ?? 'UNKNOWN',
        totalAmount: row.totalAmount,
      })),
      metrics,
      summary: {
        averageBillValue:
          (summary.billCount ?? 0) > 0
            ? roundToTwoDecimals((summary.totalRevenue ?? 0) / (summary.billCount ?? 1))
            : 0,
        billCount: summary.billCount ?? 0,
        totalDiscount: summary.totalDiscount ?? 0,
        totalRevenue: summary.totalRevenue ?? 0,
        totalTax: summary.totalTax ?? 0,
      },
      filters: buildFiltersResponse(filters),
    };
  }

  static async getRevenueAnalytics(restaurantId: string, filters: RevenueAnalyticsFilters) {
    const restaurantObjectId = toObjectId(restaurantId);
    const groupBy = filters.groupBy ?? 'day';
    const groupFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
    const matchStage = {
      restaurantId: restaurantObjectId,
      status: BillStatus.PAID,
      ...buildDateRangeMatch('paidAt', filters, { requireNonNull: true }),
    };

    const [summaryRows, revenueRows, paymentReportRows] = await Promise.all([
      BillingModel.aggregate<RevenueSummaryRow>([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalAmount' },
            totalTax: { $sum: '$taxAmount' },
            totalDiscount: { $sum: '$discountAmount' },
            billCount: { $sum: 1 },
          },
        },
      ]),
      BillingModel.aggregate<RevenuePeriodRow>([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: {
                date: '$paidAt',
                format: groupFormat,
              },
            },
            totalRevenue: { $sum: '$finalAmount' },
            totalTax: { $sum: '$taxAmount' },
            totalDiscount: { $sum: '$discountAmount' },
            billCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      BillingModel.aggregate<PaymentReportRow>([
        { $match: matchStage },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            totalAmount: { $sum: '$finalAmount' },
          },
        },
        { $sort: { totalAmount: -1, _id: 1 } },
      ]),
    ]);

    const summary = summaryRows[0] ?? {
      billCount: 0,
      totalDiscount: 0,
      totalRevenue: 0,
      totalTax: 0,
    };

    return {
      summary: {
        averageBillValue:
          (summary.billCount ?? 0) > 0
            ? roundToTwoDecimals((summary.totalRevenue ?? 0) / (summary.billCount ?? 1))
            : 0,
        billCount: summary.billCount ?? 0,
        totalDiscount: summary.totalDiscount ?? 0,
        totalRevenue: summary.totalRevenue ?? 0,
        totalTax: summary.totalTax ?? 0,
      },
      revenue: revenueRows.map((row) => ({
        billCount: row.billCount ?? 0,
        period: String(row._id),
        totalDiscount: row.totalDiscount ?? 0,
        totalRevenue: row.totalRevenue ?? 0,
        totalTax: row.totalTax ?? 0,
      })),
      paymentReport: paymentReportRows.map((row) => ({
        count: row.count,
        paymentMethod: row._id ?? 'UNKNOWN',
        totalAmount: row.totalAmount,
      })),
      filters: buildFiltersResponse(filters, groupBy),
    };
  }

  static async getPeakHours(restaurantId: string, filters: AnalyticsDateRange) {
    const rows = await OrderModel.aggregate<PeakHourRow>([
      {
        $match: {
          restaurantId: toObjectId(restaurantId),
          status: { $ne: OrderStatus.CANCELLED },
          ...buildDateRangeMatch('createdAt', filters),
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 },
          totalSales: { $sum: '$finalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const peakHours = rows.map((row) => ({
      hour: row._id,
      hourLabel: `${String(row._id).padStart(2, '0')}:00`,
      orderCount: row.orderCount,
      totalSales: row.totalSales,
    }));

    const busiestHour = peakHours.reduce<(typeof peakHours)[number] | null>((current, row) => {
      if (!current) {
        return row;
      }

      if (row.orderCount > current.orderCount) {
        return row;
      }

      if (row.orderCount === current.orderCount && row.totalSales > current.totalSales) {
        return row;
      }

      return current;
    }, null);

    return {
      peakHours,
      summary: {
        busiestHour: busiestHour?.hour ?? null,
        busiestHourLabel: busiestHour?.hourLabel ?? null,
        busiestHourOrderCount: busiestHour?.orderCount ?? 0,
        totalOrders: sum(peakHours.map((row) => row.orderCount)),
        totalSales: sum(peakHours.map((row) => row.totalSales)),
      },
      filters: buildFiltersResponse(filters),
    };
  }

  static async getRepeatCustomers(restaurantId: string, filters: AnalyticsDateRange) {
    const restaurantObjectId = toObjectId(restaurantId);
    const filteredMatch = {
      restaurantsVisited: restaurantObjectId,
      totalVisits: { $gt: 1 },
      ...buildDateRangeMatch('lastVisitAt', filters),
    };

    const [customers, customerSummaryRows] = await Promise.all([
      CustomerProfileModel.find(filteredMatch).sort({ totalVisits: -1, totalSpent: -1, lastVisitAt: -1 }).limit(10).lean(),
      CustomerProfileModel.aggregate<CustomerSummaryRow & { activeRepeatCustomers: number }>([
        { $match: { restaurantsVisited: restaurantObjectId } },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            repeatCustomers: {
              $sum: {
                $cond: [{ $gt: ['$totalVisits', 1] }, 1, 0],
              },
            },
            activeCustomers: {
              $sum: {
                $cond: [buildDateRangeExpression('$lastVisitAt', filters), 1, 0],
              },
            },
            activeRepeatCustomers: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$totalVisits', 1] },
                      buildDateRangeExpression('$lastVisitAt', filters),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const summaryRow = customerSummaryRows[0];
    const metrics = summarizeCustomerMetrics(summaryRow);

    return {
      repeatCustomers: customers.map((customer) => ({
        id: customer._id.toString(),
        lastVisitAt: customer.lastVisitAt,
        mobile: customer.mobile,
        name: customer.name,
        totalSpent: customer.totalSpent,
        totalVisits: customer.totalVisits,
      })),
      summary: {
        ...metrics,
        activeRepeatCustomers: summaryRow?.activeRepeatCustomers ?? 0,
      },
      filters: buildFiltersResponse(filters),
    };
  }

  static async getKitchenPerformance(restaurantId: string, filters: AnalyticsDateRange) {
    const restaurantObjectId = toObjectId(restaurantId);
    const orderMatch = {
      restaurantId: restaurantObjectId,
      kitchenStaffId: { $ne: null },
      status: { $ne: OrderStatus.CANCELLED },
      ...buildDateRangeMatch('createdAt', filters),
    };

    const [kitchenUsers, handledOrders] = await Promise.all([
      UserModel.find({
        restaurantId: restaurantObjectId,
        role: { $in: [UserRole.KITCHEN_STAFF, UserRole.RESTAURANT_ADMIN] },
      })
        .select('name role status')
        .lean(),
      OrderModel.find(orderMatch)
        .select('acceptedAt delayedAt finalAmount kitchenStaffId preparingStartedAt readyAt rejectedAt status totalAmount')
        .lean(),
    ]);

    const metricsByStaff = new Map<string, KitchenPerformanceAccumulator>();

    handledOrders.forEach((order) => {
      if (!order.kitchenStaffId) {
        return;
      }

      const staffId = String(order.kitchenStaffId);
      const current = metricsByStaff.get(staffId) ?? {
        delayedOrders: 0,
        measuredOrders: 0,
        orderCount: 0,
        readyOrders: 0,
        rejectedOrders: 0,
        totalMinutes: 0,
        totalSales: 0,
      };

      current.orderCount += 1;
      current.totalSales += order.finalAmount ?? order.totalAmount ?? 0;

      if (order.delayedAt || order.status === OrderStatus.DELAYED) {
        current.delayedOrders += 1;
      }

      if (order.readyAt || order.status === OrderStatus.READY) {
        current.readyOrders += 1;
      }

      if (order.rejectedAt || order.status === OrderStatus.REJECTED) {
        current.rejectedOrders += 1;
      }

      const startedAt = order.acceptedAt ?? order.preparingStartedAt ?? null;
      const finishedAt = order.readyAt ?? order.rejectedAt ?? null;

      if (startedAt && finishedAt) {
        const diffMinutes = Math.max(
          0,
          Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60000),
        );
        current.totalMinutes += diffMinutes;
        current.measuredOrders += 1;
      }

      metricsByStaff.set(staffId, current);
    });

    const kitchenPerformance = kitchenUsers
      .map((user) => {
        const stats = metricsByStaff.get(String(user._id)) ?? {
          delayedOrders: 0,
          measuredOrders: 0,
          orderCount: 0,
          readyOrders: 0,
          rejectedOrders: 0,
          totalMinutes: 0,
          totalSales: 0,
        };

        return {
          avgPreparationTimeMinutes:
            stats.measuredOrders > 0 ? roundToTwoDecimals(stats.totalMinutes / stats.measuredOrders) : 0,
          delayedOrders: stats.delayedOrders,
          id: String(user._id),
          name: user.name,
          ordersHandled: stats.orderCount,
          readyOrders: stats.readyOrders,
          rejectedOrders: stats.rejectedOrders,
          role: user.role,
          status: user.status,
          totalSales: stats.totalSales,
        };
      })
      .filter((staff) => staff.role === UserRole.KITCHEN_STAFF || staff.ordersHandled > 0)
      .sort((left, right) => right.ordersHandled - left.ordersHandled || right.totalSales - left.totalSales);

    const metricTotals = Array.from(metricsByStaff.values()).reduce(
      (current, stats) => ({
        delayedOrders: current.delayedOrders + stats.delayedOrders,
        measuredOrders: current.measuredOrders + stats.measuredOrders,
        ordersHandled: current.ordersHandled + stats.orderCount,
        readyOrders: current.readyOrders + stats.readyOrders,
        rejectedOrders: current.rejectedOrders + stats.rejectedOrders,
        totalPreparationMinutes: current.totalPreparationMinutes + stats.totalMinutes,
      }),
      {
        delayedOrders: 0,
        measuredOrders: 0,
        ordersHandled: 0,
        readyOrders: 0,
        rejectedOrders: 0,
        totalPreparationMinutes: 0,
      },
    );

    const activeKitchenStaff = kitchenPerformance.filter((staff) => staff.status === UserStatus.ACTIVE).length;

    return {
      kitchenPerformance,
      summary: {
        activeKitchenStaff,
        avgPreparationTimeMinutes:
          metricTotals.measuredOrders > 0
            ? roundToTwoDecimals(metricTotals.totalPreparationMinutes / metricTotals.measuredOrders)
            : 0,
        delayedOrders: metricTotals.delayedOrders,
        ordersHandled: metricTotals.ordersHandled,
        readyOrders: metricTotals.readyOrders,
        rejectedOrders: metricTotals.rejectedOrders,
        totalKitchenStaff: kitchenPerformance.length,
      },
      filters: buildFiltersResponse(filters),
    };
  }

  static async getSubscriptionUsageAnalytics(restaurantId: string) {
    const restaurantObjectId = toObjectId(restaurantId);
    const subscriptions = await SubscriptionModel.find({ restaurantId: restaurantObjectId }).lean();
    const planNames = Array.from(new Set(subscriptions.map((subscription) => subscription.plan ?? 'UNKNOWN')));
    const planDocs = await PlatformPlanModel.find({ name: { $in: planNames } }).lean();

    const usageAnalytics = buildSubscriptionUsageAnalytics(subscriptions, planDocs);

    return {
      planUsageSummary: usageAnalytics,
      totalPlans: usageAnalytics.length,
      totalSubscriptions: subscriptions.length,
    };
  }

  static async getTableUtilization(restaurantId: string, filters: AnalyticsDateRange) {
    const tables = await TableModel.find({
      isActive: true,
      restaurantId: toObjectId(restaurantId),
    }).lean();

    const tableUtilization = tables
      .map((table) => ({
        capacity: table.capacity,
        floor: table.floor || 1,
        id: table._id.toString(),
        section: table.section || 'General',
        status: table.status,
        tableNumber: table.tableNumber,
      }))
      .sort((left, right) => left.floor - right.floor || left.section.localeCompare(right.section) || left.tableNumber.localeCompare(right.tableNumber));

    const summary = tableUtilization.reduce(
      (current, table) => ({
        activeTables: current.activeTables + 1,
        availableTables: current.availableTables + (table.status === TableStatus.AVAILABLE ? 1 : 0),
        cleaningInProgressTables:
          current.cleaningInProgressTables + (table.status === TableStatus.CLEANING_IN_PROGRESS ? 1 : 0),
        needsCleaningTables: current.needsCleaningTables + (table.status === TableStatus.NEEDS_CLEANING ? 1 : 0),
        occupiedTables: current.occupiedTables + (table.status === TableStatus.OCCUPIED ? 1 : 0),
        paymentPendingTables:
          current.paymentPendingTables + (table.status === TableStatus.PAYMENT_PENDING ? 1 : 0),
        reservedTables: current.reservedTables + (table.status === TableStatus.RESERVED ? 1 : 0),
        totalCapacity: current.totalCapacity + table.capacity,
        totalTables: current.totalTables + 1,
      }),
      {
        activeTables: 0,
        availableTables: 0,
        cleaningInProgressTables: 0,
        needsCleaningTables: 0,
        occupiedTables: 0,
        paymentPendingTables: 0,
        reservedTables: 0,
        totalCapacity: 0,
        totalTables: 0,
      },
    );

    const sectionBreakdown = Array.from(
      tableUtilization.reduce((groups, table) => {
        const key = `${table.floor}:${table.section}`;
        const current = groups.get(key) ?? {
          availableTables: 0,
          floor: table.floor,
          occupiedTables: 0,
          reservedTables: 0,
          section: table.section,
          totalTables: 0,
        };

        current.totalTables += 1;
        current.availableTables += table.status === TableStatus.AVAILABLE ? 1 : 0;
        current.occupiedTables += table.status === TableStatus.OCCUPIED ? 1 : 0;
        current.reservedTables += table.status === TableStatus.RESERVED ? 1 : 0;
        groups.set(key, current);
        return groups;
      }, new Map<string, { availableTables: number; floor: number; occupiedTables: number; reservedTables: number; section: string; totalTables: number }>())
        .values(),
    ).sort((left, right) => left.floor - right.floor || left.section.localeCompare(right.section));

    return {
      tableUtilization,
      sectionBreakdown,
      summary: {
        ...summary,
        occupancyRatePercent:
          summary.totalTables > 0 ? roundToTwoDecimals((summary.occupiedTables / summary.totalTables) * 100) : 0,
      },
      filters: buildFiltersResponse(filters),
    };
  }

  static async getCustomerRetention(restaurantId: string, filters: AnalyticsDateRange) {
    const restaurantObjectId = toObjectId(restaurantId);
    const baseMatch = { restaurantsVisited: restaurantObjectId };
    const filteredMatch = {
      ...baseMatch,
      ...buildDateRangeMatch('lastVisitAt', filters),
    };

    const [customerSummaryRows, topCustomers] = await Promise.all([
      CustomerProfileModel.aggregate<CustomerSummaryRow>([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            repeatCustomers: {
              $sum: {
                $cond: [{ $gt: ['$totalVisits', 1] }, 1, 0],
              },
            },
            activeCustomers: {
              $sum: {
                $cond: [buildDateRangeExpression('$lastVisitAt', filters), 1, 0],
              },
            },
          },
        },
      ]),
      CustomerProfileModel.find(filteredMatch).sort({ totalVisits: -1, lastVisitAt: -1 }).limit(10).lean(),
    ]);

    const summary = summarizeCustomerMetrics(customerSummaryRows[0]);

    return {
      summary: {
        activeCustomers: summary.activeCustomers,
        repeatCustomers: summary.repeatCustomersCount,
        repeatRatePercent: summary.repeatRatePercent,
        totalCustomers: summary.totalCustomers,
      },
      customers: topCustomers.map((customer) => ({
        id: customer._id.toString(),
        lastVisitAt: customer.lastVisitAt,
        mobile: customer.mobile,
        name: customer.name,
        totalSpent: customer.totalSpent,
        totalVisits: customer.totalVisits,
      })),
      filters: buildFiltersResponse(filters),
    };
  }

  static async getInventoryAnalytics(restaurantId: string, filters: AnalyticsDateRange) {
    const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
    const createdAtMatch = buildDateRangeMatch('createdAt', filters);

    // 1. Consumption Pipeline
    const consumptionPipeline: any[] = [
      {
        $match: {
          restaurantId: restaurantObjectId,
          stockDeducted: true,
          ...createdAtMatch,
        },
      },
      { $unwind: '$items' },
      { $unwind: '$items.ingredients' },
      {
        $group: {
          _id: '$items.ingredients.inventoryItemId',
          name: { $first: '$items.ingredients.inventoryItemName' },
          totalConsumed: {
            $sum: { $multiply: ['$items.quantity', '$items.ingredients.quantity'] },
          },
        },
      },
      { $sort: { totalConsumed: -1 } },
      { $limit: 10 },
    ];

    // 2. Low Stock Trends Pipeline (Frequency of alerts)
    const trendsPipeline: any[] = [
      {
        $match: {
          restaurantId: restaurantObjectId,
          type: 'LOW_STOCK_ALERT',
          ...createdAtMatch,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          alertCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const [topConsumedIngredients, lowStockTrends] = await Promise.all([
      OrderModel.aggregate(consumptionPipeline),
      NotificationModel.aggregate(trendsPipeline),
    ]);

    logger.info('[DEBUG] AnalyticsService topConsumedIngredients', { topConsumedIngredients });
    logger.info('[DEBUG] AnalyticsService lowStockTrends', { lowStockTrends });

    return {
      topConsumedIngredients: topConsumedIngredients.map((item) => ({
        inventoryItemId: item._id,
        name: item.name,
        totalConsumed: item.totalConsumed,
      })),
      lowStockTrends: lowStockTrends.map((trend) => ({
        date: trend._id,
        alertCount: trend.alertCount,
      })),
      filters: {
        from: filters.from ?? null,
        to: filters.to ?? null,
      },
    };
  }
}
