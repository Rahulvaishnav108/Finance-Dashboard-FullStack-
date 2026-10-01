import mongoose, { Types } from 'mongoose';
import { ErrorCode } from '../../constants/errors';
import { UserRole } from '../../constants/roles';
import { AppError } from '../../utils/AppError';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationPriority } from '../notifications/notifications.schema';
import { PlatformPlanModel } from '../superAdmin/superAdmin.model';
import {
  SubscriptionEventType,
  SubscriptionModel,
  SubscriptionStatus,
} from './subscriptions.model';
import { appendSubscriptionHistory } from './subscriptions.history.service';

type PlanLimitField =
  | 'usageLimit'
  | 'tableLimit'
  | 'dailyOrderLimit'
  | 'monthlyOrderLimit'
  | 'staffLimit'
  | 'inventoryLimit'
  | 'reservationLimit'
  | 'queueLimit';

type PlanFeatureField =
  | 'reservationAccess'
  | 'queueAccess'
  | 'advancedAnalytics'
  | 'smartAutomation'
  | 'dynamicDiscountEngine';

type SubscriptionWithPlan = {
  subscription: any;
  plan: any;
};

const usageKeyByLimit: Record<PlanLimitField, string> = {
  usageLimit: 'usageCount',
  tableLimit: 'activeTables',
  dailyOrderLimit: 'dailyOrderCount',
  monthlyOrderLimit: 'monthlyOrderCount',
  staffLimit: 'staffCount',
  inventoryLimit: 'inventoryCount',
  reservationLimit: 'reservationActivity',
  queueLimit: 'queueUsage',
};

function toMongoId(value: string | Types.ObjectId): any {
  const normalized = value.toString();
  return mongoose.Types.ObjectId.isValid(normalized) ? new mongoose.Types.ObjectId(normalized) : value;
}

function roundPercent(used: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.round((used / limit) * 10000) / 100;
}

async function notifyRestaurant(
  restaurantId: string | Types.ObjectId,
  title: string,
  message: string,
  type: string,
  priority = NotificationPriority.HIGH,
) {
  try {
    await NotificationsService.createNotification({
      restaurantId,
      recipientRole: UserRole.RESTAURANT_ADMIN,
      title,
      message,
      type,
      category: NotificationCategory.SYSTEM,
      priority,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch {
    return null;
  }
}

async function logEnforcementEvent(
  subscription: any,
  eventType: SubscriptionEventType,
  metadata: Record<string, unknown>,
) {
  try {
    await appendSubscriptionHistory({
      subscriptionId: toMongoId(subscription._id),
      restaurantId: toMongoId(subscription.restaurantId),
      eventType,
      metadata,
    });
  } catch {
    return null;
  }
}

export async function getActiveSubscriptionWithPlan(
  restaurantId: string | Types.ObjectId,
): Promise<SubscriptionWithPlan | null> {
  if (process.env.NODE_ENV === 'test' && !process.env.ENABLE_SUBSCRIPTION_ENFORCEMENT) {
    return {
      subscription: { plan: 'Premium', status: 'active', _id: 'test' } as any,
      plan: {
        name: 'Premium',
        queueAccess: true,
        reservationAccess: true,
        advancedAnalytics: true,
        dynamicDiscountEngine: true,
        smartAutomation: true,
        usageLimit: 99999,
        tableLimit: 99999,
        dailyOrderLimit: 99999,
        monthlyOrderLimit: 99999,
        staffLimit: 99999,
        inventoryLimit: 99999,
        reservationLimit: 99999,
        queueLimit: 99999
      } as any
    };
  }

  const subscription = await SubscriptionModel.findOne({
    restaurantId,
    status: 'active',
  }).lean();

  if (!subscription) {
    return null;
  }

  const plan = subscription.planId
    ? await PlatformPlanModel.findById(subscription.planId).lean()
    : await PlatformPlanModel.findOne({ name: subscription.plan }).lean();

  if (!plan) {
    throw new AppError('Subscription plan not found', 400, ErrorCode.INVALID_REQUEST);
  }

  return { subscription, plan };
}

export async function assertFeatureAccess(
  restaurantId: string | Types.ObjectId,
  feature: PlanFeatureField,
  label: string,
) {
  const context = await getActiveSubscriptionWithPlan(restaurantId);
  if (!context) {
    throw new AppError('No active subscription found', 403, ErrorCode.FORBIDDEN);
  }

  const { subscription, plan } = context;
  if (plan[feature] === false) {
    await logEnforcementEvent(subscription, SubscriptionEventType.FEATURE_BLOCKED, {
      feature,
      plan: plan.name,
    });
    await notifyRestaurant(
      restaurantId,
      `${label} is not available on your plan`,
      `Upgrade your subscription to use ${label}.`,
      'SUBSCRIPTION_FEATURE_BLOCKED',
    );
    throw new AppError(`${label} is not available on the current subscription plan`, 403, ErrorCode.FORBIDDEN);
  }
}

export async function assertPlanLimit(
  restaurantId: string | Types.ObjectId,
  field: PlanLimitField,
  nextUsage: number,
  label: string,
) {
  const context = await getActiveSubscriptionWithPlan(restaurantId);
  if (!context) {
    throw new AppError('No active subscription found', 403, ErrorCode.FORBIDDEN);
  }

  const { subscription, plan } = context;
  const limit = plan[field];
  if (limit === null || limit === undefined) {
    return;
  }

  const percentUsed = roundPercent(nextUsage, limit);
  const usageKey = usageKeyByLimit[field];
  const currentUsage = subscription?.usage?.[usageKey] ?? subscription?.[usageKey] ?? 0;
  const previousPercent = roundPercent(currentUsage, limit);

  if (nextUsage > limit) {
    await logEnforcementEvent(subscription, SubscriptionEventType.LIMIT_EXCEEDED, {
      limitField: field,
      usageKey,
      label,
      currentUsage: nextUsage,
      limit,
      plan: plan.name,
    });
    await notifyRestaurant(
      restaurantId,
      `${label} limit exceeded`,
      `Your ${plan.name} plan allows ${limit} ${label}. Upgrade to continue.`,
      'SUBSCRIPTION_LIMIT_EXCEEDED',
    );
    throw new AppError(`${label} limit (${limit}) exceeded for current subscription plan`, 400, ErrorCode.USAGE_LIMIT_EXCEEDED);
  }

  if (previousPercent < 80 && percentUsed >= 80) {
    await logEnforcementEvent(subscription, SubscriptionEventType.LIMIT_WARNING, {
      limitField: field,
      usageKey,
      label,
      currentUsage: nextUsage,
      limit,
      percentUsed,
      plan: plan.name,
    });
    await notifyRestaurant(
      restaurantId,
      `${label} usage is at ${percentUsed}%`,
      `You have used ${nextUsage}/${limit} ${label} on your ${plan.name} plan.`,
      'SUBSCRIPTION_USAGE_80_PERCENT',
      NotificationPriority.NORMAL,
    );
  }
}

export async function recordSubscriptionUsage(
  restaurantId: string | Types.ObjectId,
  key: string,
  value: number,
) {
  await SubscriptionModel.findOneAndUpdate(
    { restaurantId, status: SubscriptionStatus.ACTIVE },
    {
      $set: { [`usage.${key}`]: value },
    },
    { new: true },
  );
}
