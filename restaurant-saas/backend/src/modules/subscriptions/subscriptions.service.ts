import mongoose from 'mongoose';
import {
  SubscriptionModel,
  SubscriptionPaymentModel,
  ISubscription,
  BillingCycle,
  SubscriptionEventType,
  SubscriptionPaymentProvider,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from './subscriptions.model';

import { BillingOrderInput, CreateSubscriptionInput, UpdateSubscriptionInput } from './subscriptions.schema';
import { PlatformPlanModel } from '../superAdmin/superAdmin.model';
import { RestaurantModel } from '../restaurants/restaurants.model';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationPriority } from '../notifications/notifications.schema';
import { UserRole } from '../../constants/roles';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { appendSubscriptionHistory } from './subscriptions.history.service';
import { createRazorpayOrder } from '../../services/razorpay.service';

type PlanDetails = {
  _id: mongoose.Types.ObjectId;
  name: string;
  tenantLimit: number;
  usageLimit?: number | null;
  priceMonthly: number;
  priceYearly?: number | null;
};

async function resolvePlanDetails(plan: string): Promise<PlanDetails> {
  const planDoc = await PlatformPlanModel.findOne({ name: plan }).lean();
  if (!planDoc) {
    throw new AppError(`Subscription plan '${plan}' not found`, 400, ErrorCode.INVALID_REQUEST);
  }
  return planDoc as unknown as PlanDetails;
}


async function resolvePlanUsageLimit(plan: string) {
  const planDoc = await resolvePlanDetails(plan);
  return planDoc.usageLimit ?? Number.POSITIVE_INFINITY;
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

async function syncRestaurantPlan(restaurantId: string | mongoose.Types.ObjectId, plan: string) {
  try {
    const result = RestaurantModel.findByIdAndUpdate(restaurantId, { plan }, { new: true });
    await Promise.resolve(result).catch(() => null);
  } catch {
    return null;
  }
}

function toMongoId(value: string | mongoose.Types.ObjectId): any {
  const asString = value.toString();
  return mongoose.Types.ObjectId.isValid(asString) ? new mongoose.Types.ObjectId(asString) : value;
}

async function logSubscriptionEvent(
  subscriptionId: string,
  restaurantId: string,
  type: SubscriptionEventType,
  metadata: Record<string, any> = {},
) {
  try {
    await appendSubscriptionHistory({
      subscriptionId: toMongoId(subscriptionId),
      restaurantId: toMongoId(restaurantId),
      eventType: type,
      metadata,
    });
  } catch {
    return null;
  }
}





async function sendSubscriptionNotification(
  restaurantId: string,
  title: string,
  message: string,
  type: string,
) {
  try {
    const result = NotificationsService.createNotification({
      restaurantId,
      recipientRole: UserRole.RESTAURANT_ADMIN,
      title,
      message,
      type,
      category: NotificationCategory.SYSTEM,
      priority: NotificationPriority.HIGH,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await Promise.resolve(result).catch(() => null);
  } catch {
    return null;
  }
}

function shouldNotifyUsageWarning(currentUsage: number, newUsage: number, usageLimit: number) {
  if (!Number.isFinite(usageLimit)) return false;
  const threshold = Math.floor(usageLimit * 0.8);
  return currentUsage < threshold && newUsage >= threshold && threshold > 0;
}


function buildUsageReportEntries(usage: Record<string, number>, usageLimit: number) {
  return Object.entries(usage).map(([key, currentUsage]) => {
    const remaining = Math.max(usageLimit - currentUsage, 0);
    return {
      key,
      currentUsage,
      usageLimit,
      remaining,
      percentUsed: usageLimit > 0 ? roundToTwoDecimals((currentUsage / usageLimit) * 100) : 0,
    };
  });
}

type SubscriptionUsageSummary = {
  plan?: string;
  status?: string;
  usage?: Record<string, number>;
};

function buildPlanUsageSummary(subscriptions: Array<SubscriptionUsageSummary>) {
  const planBuckets = new Map<
    string,
    {
      plan: string;
      totalSubscriptions: number;
      activeSubscriptions: number;
      usageKeys: Map<string, { totalUsage: number; maxUsage: number; sampleCount: number }>;
    }
  >();

  for (const sub of subscriptions) {
    const planName = sub.plan ?? 'UNKNOWN';
    const usage = sub.usage ?? {};
    const bucket = planBuckets.get(planName) ?? {
      plan: planName,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      usageKeys: new Map(),
    };

    bucket.totalSubscriptions += 1;
    if (sub.status === 'active') {
      bucket.activeSubscriptions += 1;
    }

    Object.entries(usage).forEach(([key, currentUsage]) => {
      const keyMetrics = bucket.usageKeys.get(key) ?? {
        totalUsage: 0,
        maxUsage: 0,
        sampleCount: 0,
      };
      keyMetrics.totalUsage += currentUsage;
      keyMetrics.maxUsage = Math.max(keyMetrics.maxUsage, currentUsage);
      keyMetrics.sampleCount += 1;
      bucket.usageKeys.set(key, keyMetrics);
    });

    planBuckets.set(planName, bucket);
  }

  return Array.from(planBuckets.values());
}

function getPlanUsageLimit(planName: string, planDocs: Array<{ name: string; usageLimit?: number }>) {
  const planDoc = planDocs.find((plan) => plan.name === planName);
  return planDoc?.usageLimit ?? Number.POSITIVE_INFINITY;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}


function getPlanAmount(plan: PlanDetails, billingCycle: BillingCycle) {
  return billingCycle === BillingCycle.YEARLY
    ? plan.priceYearly ?? plan.priceMonthly * 12
    : plan.priceMonthly;
}

function validateSeatsAgainstPlanLimit(seats: number, tenantLimit: number) {
  if (seats > tenantLimit) {
    throw new AppError(
      `Requested seats (${seats}) exceed plan tenant limit (${tenantLimit})`,
      400,
      ErrorCode.TENANT_VIOLATION,
    );
  }
}

export async function createSubscription(input: CreateSubscriptionInput) {
const existing = await SubscriptionModel.findOne({ restaurantId: input.restaurantId });
  if (existing) throw new AppError('Subscription already exists for restaurant', 409, ErrorCode.CONFLICT);

  const planDoc = await resolvePlanDetails(input.plan);
  const tenantLimit = planDoc.tenantLimit;
  const seats = input.seats ?? 1;
  validateSeatsAgainstPlanLimit(seats, tenantLimit);
  const billingCycle = (input.billingCycle ?? BillingCycle.MONTHLY) as BillingCycle;

  let periodEnd = new Date(input.currentPeriodEnd || Date.now());
  let isTrial = false;
  let trialStartsAt: Date | null = null;
  let trialEndsAt: Date | null = null;

  if (input.isTrial) {
    isTrial = true;
    trialStartsAt = new Date();
    trialEndsAt = new Date(Date.now() + (input.trialDays || 14) * 24 * 60 * 60 * 1000);
    periodEnd = trialEndsAt;
  }

  const doc = await SubscriptionModel.create({
    restaurantId: input.restaurantId as any,
    plan: planDoc.name,
    planId: planDoc._id,
    status: SubscriptionStatus.ACTIVE,
    billingCycle,
    seats,
    startedAt: new Date(),
    currentPeriodStart: new Date(),
    currentPeriodEnd: periodEnd,
    autoRenew: input.autoRenew ?? true,
    nextBillingDate: periodEnd,
    paymentProvider: input.paymentProvider ?? SubscriptionPaymentProvider.MOCK,
    providerCustomerId: input.providerCustomerId ?? null,
    providerSubscriptionId: input.providerSubscriptionId ?? null,
    lastPaymentReference: input.lastPaymentReference ?? null,
    isTrial,
    trialStartsAt,
    trialEndsAt,
  } as unknown as Partial<ISubscription>);


await syncRestaurantPlan(input.restaurantId as any, planDoc.name);
  await logSubscriptionEvent(doc._id.toString(), input.restaurantId as any, SubscriptionEventType.CREATED, {
    plan: planDoc.name,
    planId: planDoc._id,
    seats,
    billingCycle,
    autoRenew: input.autoRenew ?? true,
    isTrial,
  });
  await sendSubscriptionNotification(
    input.restaurantId as any,
    'Subscription created',
    `Subscription for plan ${planDoc.name} was created with ${seats} seats`,
    'SUBSCRIPTION_CREATED',
  );

  return doc;
}

export async function getSubscription(id: string) {
  const sub = await SubscriptionModel.findById(id).lean();
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  return sub;
}

export async function getCurrentSubscription(restaurantId: string) {
  const sub = await SubscriptionModel.findOne({ restaurantId })
    .sort({ createdAt: -1 })
    .lean();
  if (!sub) throw new AppError('No subscription found for this restaurant', 404, ErrorCode.NOT_FOUND);
  return sub;
}

export async function getSubscriptionUsage(id: string) {
  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  return sub.usage ?? {};
}

export async function getSubscriptionUsageReport(id: string) {
  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  const usage = sub.usage ?? {};
  const usageLimit = await resolvePlanUsageLimit(sub.plan);

  return {
    subscriptionId: sub._id.toString(),
    plan: sub.plan,
    status: sub.status,
    usageReport: buildUsageReportEntries(usage, usageLimit),
    usageLimit,
    updatedAt: sub.updatedAt ?? sub.createdAt,
  };
}

export async function listSubscriptions() {
  return SubscriptionModel.find().lean();
}

export async function getPlanUsageAnalytics() {
  const subscriptions = await SubscriptionModel.find().lean() as SubscriptionUsageSummary[];
  const planNames = Array.from(new Set(subscriptions.map((sub) => sub.plan ?? 'UNKNOWN')));
  const planDocs = await PlatformPlanModel.find({ name: { $in: planNames } }).lean();

  const planUsageRows = buildPlanUsageSummary(subscriptions).map((bucket) => {
    const usageLimit = getPlanUsageLimit(bucket.plan, planDocs);
    const usageEntries = Array.from(bucket.usageKeys.entries()).map(([key, metrics]) => ({
      key,
      averageUsage: metrics.sampleCount > 0 ? roundToTwoDecimals(metrics.totalUsage / metrics.sampleCount) : 0,
      peakUsage: metrics.maxUsage,
      sampleCount: metrics.sampleCount,
      usageLimit,
      averagePercentUsed: usageLimit > 0 ? roundToTwoDecimals((metrics.totalUsage / metrics.sampleCount / usageLimit) * 100) : 0,
    }));

    return {
      plan: bucket.plan,
      totalSubscriptions: bucket.totalSubscriptions,
      activeSubscriptions: bucket.activeSubscriptions,
      usageMetrics: usageEntries,
    };
  });

  return {
    planUsage: planUsageRows,
    totalPlans: planUsageRows.length,
    totalSubscriptions: subscriptions.length,
  };
}

export async function updateSubscription(id: string, input: UpdateSubscriptionInput) {
  const existingSubscription = await SubscriptionModel.findById(id);
  if (!existingSubscription) {
    throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  }

  const targetPlan = input.plan ?? existingSubscription.plan;
  const targetSeats = input.seats ?? existingSubscription.seats ?? 1;
  const targetPlanDoc = await resolvePlanDetails(targetPlan);
  const tenantLimit = targetPlanDoc.tenantLimit;
  validateSeatsAgainstPlanLimit(targetSeats, tenantLimit);
  const updatePayload: Record<string, unknown> = { ...input };
  if (input.plan) {
    updatePayload.plan = targetPlanDoc.name;
    updatePayload.planId = targetPlanDoc._id;
  }

  const sub = await SubscriptionModel.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);

  if (input.plan && input.plan !== existingSubscription.plan) {
    await syncRestaurantPlan(existingSubscription.restaurantId, targetPlanDoc.name);
    await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.UPDATED, {
      fromPlan: existingSubscription.plan,
      toPlan: targetPlanDoc.name,
      planId: targetPlanDoc._id,
      seats: targetSeats,
    });
    await sendSubscriptionNotification(
      existingSubscription.restaurantId.toString(),
      'Subscription plan updated',
      `Your subscription plan has been updated from ${existingSubscription.plan} to ${targetPlanDoc.name}.`,
      'SUBSCRIPTION_PLAN_UPDATED',
    );
  }

  return sub;
}

export async function setStatus(id: string, status: string) {
  const sub = await SubscriptionModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.UPDATED, { status });
  return sub;
}

export async function activate(id: string) {
  const sub = await setStatus(id, 'active');
  await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.ACTIVATED);
  await sendSubscriptionNotification(
    sub.restaurantId.toString(),
    'Subscription activated',
    `Subscription ${sub._id.toString()} is now active.`,
    'SUBSCRIPTION_ACTIVATED',
  );
  return sub;
}

export async function cancel(id: string, immediate = true) {
  if (immediate) {
    const sub = await SubscriptionModel.findByIdAndUpdate(
      id,
      { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date(), autoRenew: false },
      { new: true },
    );
    if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
    await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.CANCELLED, {
      immediate: true,
    });
    await sendSubscriptionNotification(
      sub.restaurantId.toString(),
      'Subscription cancelled',
      `Subscription ${sub._id.toString()} has been cancelled.`,
      'SUBSCRIPTION_CANCELLED',
    );
    return sub;
  }
  // schedule cancellation at period end
  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  // mark as cancelled but keep active until period end
  sub.cancellationRequestedAt = new Date();
  sub.autoRenew = false;
  sub.metadata = {
    ...(sub.metadata ?? {}),
    cancelAtPeriodEnd: true,
    cancellationRequestedAt: sub.cancellationRequestedAt,
  };
  await sub.save();
  await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.CANCELLATION_SCHEDULED, {
    appliesAt: sub.currentPeriodEnd,
  });
  await sendSubscriptionNotification(
    sub.restaurantId.toString(),
    'Subscription cancellation scheduled',
    `Subscription ${sub._id.toString()} has been scheduled for cancellation at the end of the current period.`,
    'SUBSCRIPTION_CANCELLATION_SCHEDULED',
  );
  return sub;
}

export async function renew(id: string, days = 30) {
  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  const periodStart = new Date();
  sub.status = SubscriptionStatus.ACTIVE;
  sub.currentPeriodStart = periodStart;
  sub.currentPeriodEnd = addDays(periodStart, days);
  sub.nextBillingDate = sub.currentPeriodEnd;
  sub.expiredAt = null;
  sub.cancelledAt = null;
  sub.isTrial = false;
  sub.trialEndsAt = null;
  sub.trialStartsAt = null;
  await sub.save();
  await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.RENEWED, {
    days,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
  });
  await sendSubscriptionNotification(
    sub.restaurantId.toString(),
    'Subscription renewed',
    `Subscription ${sub._id.toString()} has been renewed for an additional ${days} days.`,
    'SUBSCRIPTION_RENEWED',
  );
  return sub;
}

function normalizePlanInput(input: any): { plan?: string; seats?: number; billingCycle?: any } {
  return {
    plan: typeof input?.plan === 'string' ? input.plan : undefined,
    seats: typeof input?.seats === 'number' ? input.seats : undefined,
    billingCycle: input?.billingCycle,
  };
}

export async function upgradeSubscription(id: string, input: UpdateSubscriptionInput & { seats?: number }) {
  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  const { plan, seats, billingCycle } = normalizePlanInput(input);

  if (!plan) {
    throw new AppError('plan is required for upgrade', 400, ErrorCode.INVALID_REQUEST);
  }

  // Upgrade applies immediately per chosen defaults
  const targetSeats = seats ?? sub.seats ?? 1;
  const planDoc = await resolvePlanDetails(plan);
  const tenantLimit = planDoc.tenantLimit;
  validateSeatsAgainstPlanLimit(targetSeats, tenantLimit);

  const previousPlan = sub.plan;
  sub.plan = planDoc.name;
  sub.planId = planDoc._id;
  sub.seats = targetSeats;
  if (billingCycle) {
    sub.billingCycle = billingCycle;
  }
  // Ensure dates are set consistently
  sub.currentPeriodStart = sub.currentPeriodStart ?? new Date();
  sub.currentPeriodEnd = sub.currentPeriodEnd ?? new Date();

  sub.status = SubscriptionStatus.ACTIVE;
  await sub.save();

  await syncRestaurantPlan(sub.restaurantId, planDoc.name);

  await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.UPGRADED, {


    fromPlan: previousPlan,
    toPlan: planDoc.name,
    toPlanId: planDoc._id,
    seats: targetSeats,
    billingCycle: sub.billingCycle,
    appliesAt: new Date(),
    paymentProvider: sub.paymentProvider,
    currentPeriodEnd: sub.currentPeriodEnd,
  } as any);





  await sendSubscriptionNotification(
    sub.restaurantId.toString(),
    'Subscription upgraded',
    `Your subscription has been upgraded from ${previousPlan} to ${planDoc.name}.`,
    'SUBSCRIPTION_UPGRADED',
  );

  return sub;
}

export async function downgradeSubscription(id: string, input: UpdateSubscriptionInput & { seats?: number }) {

  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  const { plan, seats } = normalizePlanInput(input);

  if (!plan) {
    throw new AppError('plan is required for downgrade', 400, ErrorCode.INVALID_REQUEST);
  }

  // Downgrade applies at period end per chosen defaults.
  // We record the desired plan in metadata (until proper history model wiring is added).
  const targetSeats = seats ?? sub.seats ?? 1;
  const planDoc = await resolvePlanDetails(plan);
  const tenantLimit = planDoc.tenantLimit;
  validateSeatsAgainstPlanLimit(targetSeats, tenantLimit);

  sub.metadata = {
    ...(sub.metadata ?? {}),
    pendingDowngrade: {
      plan: planDoc.name,
      planId: planDoc._id,
      seats: targetSeats,
      requestedAt: new Date(),
      appliesAt: sub.currentPeriodEnd,
    },
  };

  await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.DOWNGRADED, {

    from: sub.plan,
    toPlan: planDoc.name,
    toPlanId: planDoc._id,
    seats: targetSeats,
    appliesAt: sub.currentPeriodEnd,
    appliesAtPeriodEnd: true,
  } as any);

  await sendSubscriptionNotification(
    sub.restaurantId.toString(),
    'Subscription downgrade scheduled',
    `Your downgrade to ${planDoc.name} is scheduled to apply at the end of the current billing period.`,
    'SUBSCRIPTION_DOWNGRADED_SCHEDULED',
  );

  await sub.save();
  return sub;
}

export async function expireSubscription(id: string, immediate?: boolean) {
  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);

  // Per chosen defaults: expire at period end unless immediate is explicitly set.
  if (!immediate) {
    sub.cancellationRequestedAt = new Date();
    sub.autoRenew = false;
    sub.metadata = {
      ...(sub.metadata ?? {}),
      expireAtPeriodEnd: true,
      expiryRequestedAt: sub.cancellationRequestedAt,
    };

    await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.CANCELLATION_SCHEDULED, {
      reason: 'manual_or_scheduler',
    } as any);

    await sendSubscriptionNotification(
      sub.restaurantId.toString(),
      'Subscription expiry scheduled',
      `Your subscription will expire at the end of the current billing period.`,
      'SUBSCRIPTION_EXPIRY_SCHEDULED',
    );

    await sub.save();
    return sub;
  }

sub.status = SubscriptionStatus.EXPIRED;
  sub.expiredAt = new Date();
  sub.autoRenew = false;
  await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.EXPIRED, {} as any);

  await syncRestaurantPlan(sub.restaurantId, sub.plan);

  await sendSubscriptionNotification(
    sub.restaurantId.toString(),
    'Subscription expired',
    `Your subscription has expired.`,
    'SUBSCRIPTION_EXPIRED',
  );

  await sub.save();
  return sub;
}

export async function getSubscriptionHistory(id: string) {
  const sub = await SubscriptionModel.findById(id).lean();
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  const { RestaurantSubscriptionHistoryModel } = await import('./restaurantSubscriptionHistory.model');
  return RestaurantSubscriptionHistoryModel.find({ subscriptionId: id }).sort({ createdAt: -1 }).lean();
}

export async function createBillingOrder(id: string, input: BillingOrderInput) {
  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);

  const planDoc = await resolvePlanDetails(sub.plan);
  const amount = getPlanAmount(planDoc, sub.billingCycle);
  const provider = input.provider as SubscriptionPaymentProvider;
  const receipt = `sub_${sub._id.toString().slice(-12)}_${Date.now()}`;

  let providerOrderId: string | null = null;
  let providerPayload: Record<string, unknown> = {};

  if (provider === SubscriptionPaymentProvider.RAZORPAY) {
    const order = await createRazorpayOrder({
      amount,
      currency: input.currency,
      receipt,
      notes: {
        subscriptionId: sub._id.toString(),
        restaurantId: sub.restaurantId.toString(),
        plan: sub.plan,
        planId: sub.planId.toString(),
        billingCycle: sub.billingCycle,
      },
    });
    providerOrderId = order.id;
    providerPayload = order as unknown as Record<string, unknown>;
  } else {
    providerOrderId = `mock_sub_order_${Date.now()}`;
    providerPayload = { id: providerOrderId, receipt, status: 'created' };
  }

  const payment = await SubscriptionPaymentModel.create({
    subscriptionId: sub._id,
    restaurantId: sub.restaurantId,
    planId: planDoc._id,
    provider,
    status: SubscriptionPaymentStatus.PENDING,
    billingCycle: sub.billingCycle,
    amount,
    currency: input.currency,
    providerOrderId,
    metadata: {
      receipt,
      source: 'subscription_billing_order',
    },
  });

  sub.lastPaymentId = payment._id as any;
  sub.lastPaymentReference = providerOrderId;
  await sub.save();

  await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.PAYMENT_CREATED, {
    paymentId: payment._id,
    provider,
    providerOrderId,
    amount,
    currency: input.currency,
  });

  return { payment, providerOrder: providerPayload };
}


export async function incrementUsage(id: string, key: string, delta = 1) {
  const sub = await SubscriptionModel.findById(id);
  if (!sub) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);
  if (sub.status !== 'active') {
    throw new AppError('Cannot record usage for inactive subscription', 400, ErrorCode.INVALID_REQUEST);
  }

  const usageLimit = await resolvePlanUsageLimit(sub.plan);
  const currentUsage = sub.usage?.[key] ?? 0;
  const newUsage = currentUsage + delta;

  const reachedLimit = newUsage >= usageLimit;
  const overLimit = newUsage > usageLimit;
  const thresholdCrossed = shouldNotifyUsageWarning(currentUsage, newUsage, usageLimit);

  if (overLimit) {
    await logSubscriptionEvent(sub._id.toString(), sub.restaurantId.toString(), SubscriptionEventType.LIMIT_EXCEEDED, {
      key,
      currentUsage,
      newUsage,
      usageLimit,
    });
    await sendSubscriptionNotification(
      sub.restaurantId.toString(),
      'Subscription usage limit reached',
      `Usage for '${key}' has exceeded the plan limit of ${usageLimit}. Please upgrade your plan to continue.`,
      'SUBSCRIPTION_USAGE_LIMIT_EXCEEDED',
    );
    throw new AppError(
      `Usage for '${key}' (${newUsage}) exceeds plan limit (${usageLimit})`,
      400,
      ErrorCode.USAGE_LIMIT_EXCEEDED,
    );
  }

  await SubscriptionModel.updateOne({ _id: id }, { $inc: { [`usage.${key}`]: delta } });
  const updated = await SubscriptionModel.findById(id);
  if (!updated) throw new AppError('Subscription not found', 404, ErrorCode.NOT_FOUND);

  await logSubscriptionEvent(updated._id.toString(), updated.restaurantId.toString(), SubscriptionEventType.USAGE_RECORDED, {
    key,
    delta,
    currentUsage: newUsage,
    usageLimit,
  });

  if (reachedLimit) {
    await logSubscriptionEvent(updated._id.toString(), updated.restaurantId.toString(), SubscriptionEventType.LIMIT_EXCEEDED, {
      key,
      currentUsage: newUsage,
      usageLimit,
    });
    await sendSubscriptionNotification(
      updated.restaurantId.toString(),
      'Subscription usage cap reached',
      `Usage for '${key}' has reached the plan limit of ${usageLimit}. Upgrade your subscription to avoid interruptions.`,
      'SUBSCRIPTION_USAGE_LIMIT_REACHED',
    );
  } else if (thresholdCrossed) {
    await logSubscriptionEvent(updated._id.toString(), updated.restaurantId.toString(), SubscriptionEventType.LIMIT_WARNING, {
      key,
      currentUsage: newUsage,
      usageLimit,
      percentUsed: roundToTwoDecimals((newUsage / usageLimit) * 100),
    });
    await sendSubscriptionNotification(
      updated.restaurantId.toString(),
      'Subscription usage warning',
      `Usage for '${key}' is now ${newUsage}/${usageLimit} (${roundToTwoDecimals((newUsage / usageLimit) * 100)}%).`,
      'SUBSCRIPTION_USAGE_WARNING',
    );
  }

  return updated;
}
