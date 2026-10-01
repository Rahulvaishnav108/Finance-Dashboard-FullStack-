import cron from 'node-cron';
import logger from '../config/logger';
import { UserRole } from '../constants/roles';
import { RestaurantModel } from '../modules/restaurants/restaurants.model';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { NotificationCategory, NotificationPriority } from '../modules/notifications/notifications.schema';
import {
  BillingCycle,
  SubscriptionEventType,
  SubscriptionPaymentProvider,
  SubscriptionStatus,
  SubscriptionModel,
} from '../modules/subscriptions/subscriptions.model';
import { appendSubscriptionHistory } from '../modules/subscriptions/subscriptions.history.service';
import { withLock } from '../utils/cronLock';
import { PlatformPlanModel } from '../modules/superAdmin/superAdmin.model';
import { createBillingOrder, renew } from '../modules/subscriptions/subscriptions.service';

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function billingDays(cycle: BillingCycle) {
  return cycle === BillingCycle.YEARLY ? 365 : 30;
}

async function notify(restaurantId: any, title: string, message: string, type: string) {
  try {
    await NotificationsService.createNotification({
      restaurantId,
      recipientRole: UserRole.RESTAURANT_ADMIN,
      title,
      message,
      type,
      category: NotificationCategory.SYSTEM,
      priority: NotificationPriority.HIGH,
      expiresAt: addDays(new Date(), 7),
    });
  } catch {
    return null;
  }
}

async function log(subscription: any, type: SubscriptionEventType, metadata: Record<string, unknown>) {
  try {
    await appendSubscriptionHistory({
      subscriptionId: subscription._id,
      restaurantId: subscription.restaurantId,
      eventType: type,
      metadata,
    });
  } catch {
    return null;
  }
}

async function applyPendingDowngrade(subscription: any) {
  const pending = subscription.metadata?.pendingDowngrade;
  if (!pending?.plan || !pending?.appliesAt || new Date(pending.appliesAt) > new Date()) {
    return false;
  }

  const plan = await PlatformPlanModel.findOne({ name: pending.plan }).lean();
  if (!plan) {
    return false;
  }

  const previousPlan = subscription.plan;
  subscription.plan = plan.name;
  subscription.planId = plan._id;
  subscription.seats = pending.seats ?? subscription.seats;
  subscription.metadata = {
    ...(subscription.metadata ?? {}),
    pendingDowngrade: undefined,
  };

  await RestaurantModel.findByIdAndUpdate(subscription.restaurantId, { plan: plan.name });
  await log(subscription, SubscriptionEventType.DOWNGRADED, {
    fromPlan: previousPlan,
    toPlan: plan.name,
    planId: plan._id,
    appliedAt: new Date(),
  });
  await notify(
    subscription.restaurantId,
    'Subscription downgraded',
    `Your subscription has been downgraded from ${previousPlan} to ${plan.name}.`,
    'SUBSCRIPTION_DOWNGRADED',
  );

  return true;
}

export async function processSubscriptionLifecycle() {
  const now = new Date();
  const subscriptions = await SubscriptionModel.find({
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED, SubscriptionStatus.PAST_DUE] },
  });

  let processed = 0;

  for (const subscription of subscriptions) {
    processed += 1;
    await applyPendingDowngrade(subscription);

    const msUntilExpiry = subscription.currentPeriodEnd.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(msUntilExpiry / (24 * 60 * 60 * 1000));

    if (daysUntilExpiry === 7 || daysUntilExpiry === 3 || daysUntilExpiry === 1) {
      await notify(
        subscription.restaurantId,
        'Subscription renewal reminder',
        `Your ${subscription.plan} subscription renews in ${daysUntilExpiry} day(s).`,
        'SUBSCRIPTION_RENEWAL_REMINDER',
      );
    }

    if (subscription.currentPeriodEnd > now) {
      await subscription.save();
      continue;
    }

    if (subscription.metadata?.cancelAtPeriodEnd || subscription.metadata?.expireAtPeriodEnd || !subscription.autoRenew) {
      subscription.status = SubscriptionStatus.EXPIRED;
      subscription.expiredAt = now;
      subscription.autoRenew = false;
      await subscription.save();
      await log(subscription, SubscriptionEventType.EXPIRED, { reason: 'period_end' });
      await notify(
        subscription.restaurantId,
        'Subscription expired',
        `Your ${subscription.plan} subscription has expired.`,
        'SUBSCRIPTION_EXPIRED',
      );
      continue;
    }

    if (subscription.paymentProvider === SubscriptionPaymentProvider.MOCK || subscription.paymentProvider === SubscriptionPaymentProvider.MANUAL) {
      await renew(subscription._id.toString(), billingDays(subscription.billingCycle));
      continue;
    }

    await createBillingOrder(subscription._id.toString(), {
      provider: subscription.paymentProvider,
      currency: 'INR',
    });
    subscription.status = SubscriptionStatus.PAST_DUE;
    subscription.nextBillingDate = addDays(now, 1);
    await subscription.save();
    await notify(
      subscription.restaurantId,
      'Subscription payment required',
      `Payment is required to renew your ${subscription.plan} subscription.`,
      'SUBSCRIPTION_PAYMENT_REQUIRED',
    );
  }

  return { processed };
}

export function startSubscriptionsLifecycleJob(): void {
  cron.schedule('0 * * * *', async () => {
    logger.info('Starting subscriptions lifecycle job...');
    try {
      await withLock('subscriptions-lifecycle', 30 * 60, async () => {
        const result = await processSubscriptionLifecycle();
        logger.info('Subscription lifecycle processing completed', result);
      });
      logger.info('Finished subscriptions lifecycle job.');
    } catch (error) {
      logger.error('Subscription lifecycle processing failed', { error });
    }
  });
}
