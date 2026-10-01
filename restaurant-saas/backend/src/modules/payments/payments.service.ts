import mongoose from 'mongoose';
import { ErrorCode } from '../../constants/errors';
import { PaymentStatus } from '../../constants/statuses';
import { AppError } from '../../utils/AppError';
import { BillingModel } from '../billing/billing.model';
import {
  PaymentMethod,
  PaymentStatus as BillingPaymentStatus,
} from '../billing/billing.schema';
import { BillingService } from '../billing/billing.service';
import { PaymentModel } from './payments.model';
import type { IPayment } from './payments.model'; // used for explicit document casting below
import type { ListPaymentsQuery, VerifyPaymentInput } from './payments.schema';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  createRazorpayRefund,
} from '../../services/razorpay.service';
import { env } from '../../config/env';

function toObjectId(value: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError('Invalid id', 400, ErrorCode.INVALID_REQUEST);
  }

  return new mongoose.Types.ObjectId(value);
}

function mapVerificationStatus(status?: VerifyPaymentInput['simulateStatus']): BillingPaymentStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (status === 'COMPLETED' || status === 'PAID') {
    return undefined;
  }

  return status as BillingPaymentStatus;
}

function buildPaymentFilter(restaurantId: string, query: ListPaymentsQuery) {
  const filter: Record<string, unknown> = {
    restaurantId: toObjectId(restaurantId),
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.method) {
    filter.method = query.method;
  }

  if (query.sessionId) {
    filter.sessionId = toObjectId(query.sessionId);
  }

  if (query.orderId) {
    filter.orderId = toObjectId(query.orderId);
  }

  if (query.from || query.to) {
    filter.createdAt = {
      ...(query.from && { $gte: query.from }),
      ...(query.to && { $lte: query.to }),
    };
  }

  return filter;
}

export class PaymentsService {
  static async createCustomerPayment(restaurantId: string, sessionId: string, method: PaymentMethod) {
    // Step 1: Build the bill via BillingService (creates/updates Bill document)
    const result = await BillingService.createPayment(restaurantId, sessionId, method);

    const isCashPayment = method === PaymentMethod.CASH;
    const isRazorpayEnabled = !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

    let razorpayOrderId: string | null = null;
    let providerPaymentId = result.paymentIntentId; // default: mock intent id

    // Step 2: For online methods (UPI, CARD, ONLINE, WALLET) + Razorpay configured
    //         → create a real Razorpay order
    if (!isCashPayment && isRazorpayEnabled) {
      const rzpOrder = await createRazorpayOrder({
        amount: result.amount,           // in ₹ — service converts to paise
        currency: result.currency ?? 'INR',
        receipt: String(result.billId),  // your internal bill ID as receipt
        notes: {
          restaurantId,
          sessionId,
          billId: String(result.billId),
          method,
        },
      });

      razorpayOrderId = rzpOrder.id;     // e.g. "order_Abc123XYZ"
      providerPaymentId = rzpOrder.id;   // store Razorpay order ID as provider ref

      await BillingModel.findByIdAndUpdate(result.billId, {
        paymentId: rzpOrder.id,
      });
    }

    // Step 3: Update the PaymentModel record created by BillingService
    const payment = await PaymentModel.findOneAndUpdate(
      {
        restaurantId: toObjectId(restaurantId),
        sessionId: toObjectId(sessionId),
        status: PaymentStatus.PENDING,
      },
      {
        provider: isRazorpayEnabled && !isCashPayment ? 'razorpay' : 'mock',
        providerPaymentId,
        razorpayOrderId,
        currency: result.currency ?? 'INR',
        metadata: {
          billId: result.billId,
          source: 'customer_payment_create',
        },
      },
      { new: true, sort: { createdAt: -1 } },
    ).lean();

    return {
      ...result,
      paymentId: razorpayOrderId ?? result.paymentIntentId,
      // Key fields the frontend needs to open Razorpay checkout
      razorpayOrderId,
      razorpayKeyId: isRazorpayEnabled && !isCashPayment ? env.RAZORPAY_KEY_ID : null,
      provider: isRazorpayEnabled && !isCashPayment ? 'razorpay' : 'mock',
      payment,
    };
  }

  static async verifyCustomerPayment(
    restaurantId: string,
    sessionId: string,
    paymentId: string,
    simulateStatus?: VerifyPaymentInput['simulateStatus'],
    razorpayFields?: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    const isRazorpayEnabled = !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

    // --- RAZORPAY SIGNATURE VERIFICATION ---
    // If Razorpay fields are provided, verify signature before anything else.
    // This is the most important security step — prevents fake payment confirmations.
    if (razorpayFields && isRazorpayEnabled) {
      const isValid = verifyRazorpaySignature(razorpayFields);

      if (!isValid) {
        throw new AppError(
          'Payment signature verification failed. Possible tampered request.',
          400,
          ErrorCode.PAYMENT_FAILED,
        );
      }

      // Update PaymentModel with real Razorpay payment ID
      await PaymentModel.findOneAndUpdate(
        {
          restaurantId: toObjectId(restaurantId),
          sessionId: toObjectId(sessionId),
          $or: [
            { razorpayOrderId: razorpayFields.razorpay_order_id },
            { providerPaymentId: razorpayFields.razorpay_order_id },
          ],
        },
        {
          razorpayPaymentId: razorpayFields.razorpay_payment_id,
          razorpaySignature: razorpayFields.razorpay_signature,
          providerPaymentId: razorpayFields.razorpay_payment_id,
        },
        { new: true },
      );
    }

    // --- MARK BILL PAID ---
    // paymentId here is either the mock intentId or Razorpay order_id
    const bill = await BillingService.verifyPayment(
      restaurantId,
      sessionId,
      paymentId,
      mapVerificationStatus(simulateStatus),
    );

    const payment = await PaymentModel.findOne({
      restaurantId: toObjectId(restaurantId),
      sessionId: toObjectId(sessionId),
      $or: [
        { providerPaymentId: paymentId },
        { razorpayOrderId: paymentId },
        { _id: mongoose.Types.ObjectId.isValid(paymentId) ? toObjectId(paymentId) : null },
      ],
    }).lean();

    return {
      bill,
      payment,
    };
  }

  static async getCustomerPaymentStatus(restaurantId: string, sessionId: string, paymentId: string) {
    const payment = await PaymentModel.findOne({
      restaurantId: toObjectId(restaurantId),
      sessionId: toObjectId(sessionId),
      $or: [{ providerPaymentId: paymentId }, { _id: mongoose.Types.ObjectId.isValid(paymentId) ? toObjectId(paymentId) : null }],
    }).lean();

    if (payment) {
      return {
        paymentId: payment.providerPaymentId ?? payment._id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        verifiedAt: payment.verifiedAt,
        failureReason: payment.failureReason,
      };
    }

    const bill = await BillingModel.findOne({
      restaurantId: toObjectId(restaurantId),
      sessionId: toObjectId(sessionId),
      paymentId,
    }).lean();

    if (!bill) {
      throw new AppError('Payment not found', 404, ErrorCode.NOT_FOUND);
    }

    return {
      paymentId,
      status: bill.paymentStatus ?? BillingPaymentStatus.PENDING,
      method: bill.paymentMethod,
      amount: bill.finalAmount,
      currency: 'INR',
      paidAt: bill.paidAt,
    };
  }

  static async listCustomerPayments(restaurantId: string, sessionId: string) {
    const payments = await PaymentModel.find({
      restaurantId: toObjectId(restaurantId),
      sessionId: toObjectId(sessionId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      payments,
      meta: {
        count: payments.length,
      },
    };
  }

  static async listRestaurantPayments(restaurantId: string, query: ListPaymentsQuery) {
    const filter = buildPaymentFilter(restaurantId, query);
    const skip = (query.page - 1) * query.limit;

    const [payments, total] = await Promise.all([
      PaymentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
      PaymentModel.countDocuments(filter),
    ]);

    return {
      payments,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  }

  static async getRestaurantPaymentSummary(restaurantId: string, query: ListPaymentsQuery) {
    const filter = buildPaymentFilter(restaurantId, query);
    const [summary] = await PaymentModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          completedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', PaymentStatus.COMPLETED] }, '$amount', 0],
            },
          },
          totalPayments: { $sum: 1 },
          completedPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', PaymentStatus.COMPLETED] }, 1, 0],
            },
          },
          failedPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', PaymentStatus.FAILED] }, 1, 0],
            },
          },
          refundedPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', PaymentStatus.REFUNDED] }, 1, 0],
            },
          },
        },
      },
    ]);

    const byMethod = await PaymentModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    return {
      summary: summary ?? {
        totalAmount: 0,
        completedAmount: 0,
        totalPayments: 0,
        completedPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
      },
      byMethod,
      filters: {
        status: query.status ?? null,
        method: query.method ?? null,
        from: query.from ?? null,
        to: query.to ?? null,
      },
    };
  }

  static async refundPayment(
    restaurantId: string,
    paymentId: string,
    refundAmountInRupees?: number,
    reason?: string,
  ) {
    const payment = (await PaymentModel.findOne({
      restaurantId: toObjectId(restaurantId),
      $or: [
        { providerPaymentId: paymentId },
        { razorpayPaymentId: paymentId },
        { _id: mongoose.Types.ObjectId.isValid(paymentId) ? toObjectId(paymentId) : null },
      ],
      status: PaymentStatus.COMPLETED,
    })) as (IPayment & { _id: mongoose.Types.ObjectId }) | null;

    if (!payment) {
      throw new AppError('Completed payment not found for refund', 404, ErrorCode.NOT_FOUND);
    }

    const amountToRefund = refundAmountInRupees ?? payment.amount;
    const isRazorpayEnabled = !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

    // If this was a Razorpay payment, issue real refund
    if (payment.provider === 'razorpay' && payment.razorpayPaymentId && isRazorpayEnabled) {
      await createRazorpayRefund(payment.razorpayPaymentId, amountToRefund, {
        reason: reason ?? 'Refund requested',
        restaurantId,
      });
    }

    payment.status = PaymentStatus.REFUNDED as any;
    await payment.save();

    return payment;
  }

  static async handleRazorpayWebhook(
    rawBody: string,
    signature: string,
    webhookSecret: string,
  ) {
    const { verifyWebhookSignature } = await import('../../services/razorpay.service');

    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      throw new AppError('Invalid webhook signature', 400, ErrorCode.PAYMENT_FAILED);
    }

    const event = JSON.parse(rawBody);
    const entity = event?.payload?.payment?.entity;

    if (!entity) return { received: true };

    const rzpPaymentId = entity.id;
    const rzpOrderId = entity.order_id;
    const eventType = event.event;

    // Razorpay usually includes `notes` inside the payment entity.
    // For subscription billing linkage, we rely on:
    // - notes.subscriptionId
    // - notes.restaurantId
    const notes = entity?.notes ?? {};
    const maybeSubscriptionId = notes?.subscriptionId ? String(notes.subscriptionId) : undefined;
    const maybeRestaurantId = notes?.restaurantId ? String(notes.restaurantId) : undefined;

    // ---- Subscription billing path ----
    if (maybeSubscriptionId) {
      const subscriptionId = maybeSubscriptionId;
      const restaurantId = maybeRestaurantId;

      if (!restaurantId) {
        return { received: true, event: eventType, subscription: subscriptionId, reason: 'missing_restaurantId' };
      }

      const planAmount = entity.amount ? Number(entity.amount) / 100 : 0;

      const { SubscriptionPaymentModel, SubscriptionModel, SubscriptionEventModel } = await import('../../modules/subscriptions/subscriptions.model');
      const { SubscriptionPaymentProvider, SubscriptionPaymentStatus, SubscriptionEventType } = await import('../../modules/subscriptions/subscriptions.model');

      if (eventType === 'payment.captured') {
        await SubscriptionPaymentModel.findOneAndUpdate(
          {
            subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
            providerOrderId: rzpOrderId,
          },
          {
            providerPaymentId: rzpPaymentId,
            status: SubscriptionPaymentStatus.COMPLETED,
            paidAt: new Date(),
            webhookEventId: event?.id ? String(event.id) : null,
            metadata: { ...(entity?.notes ?? {}), source: 'razorpay_webhook' },
          },
          { new: true, upsert: true },
        );

        const sub = await SubscriptionModel.findById(subscriptionId);
        if (sub) {
          const addDays = sub.billingCycle === 'yearly' ? 365 : 30;
          sub.currentPeriodStart = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : new Date();
          sub.currentPeriodEnd = new Date(Date.now() + addDays * 24 * 60 * 60 * 1000);
          sub.status = SubscriptionPaymentStatus.COMPLETED as any;
          sub.nextBillingDate = sub.autoRenew ? new Date(sub.currentPeriodEnd) : null;
          sub.lastPaymentReference = String(rzpPaymentId);

          await sub.save();

          await SubscriptionEventModel.create({
            subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            type: SubscriptionEventType.PAYMENT_COMPLETED,
            metadata: {
              paymentProvider: SubscriptionPaymentProvider.RAZORPAY,
              amount: planAmount,
              orderId: rzpOrderId,
              paymentId: rzpPaymentId,
              fromPlan: sub.plan,
            },
          });

          await SubscriptionEventModel.create({
            subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            type: SubscriptionEventType.RENEWED,
            metadata: { newPeriodEnd: sub.currentPeriodEnd, addDays },
          });
        }
      }

      if (eventType === 'payment.failed') {
        await SubscriptionPaymentModel.findOneAndUpdate(
          {
            subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
            providerOrderId: rzpOrderId,
          },
          {
            providerPaymentId: rzpPaymentId,
            status: SubscriptionPaymentStatus.FAILED,
            failedAt: new Date(),
            webhookEventId: event?.id ? String(event.id) : null,
            metadata: {
              ...(entity?.notes ?? {}),
              source: 'razorpay_webhook',
              error: entity?.error_description ?? null,
            },
          },
          { new: true, upsert: true },
        );

        await SubscriptionEventModel.create({
          subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          type: SubscriptionEventType.PAYMENT_FAILED,
          metadata: {
            orderId: rzpOrderId,
            paymentId: rzpPaymentId,
            error: entity?.error_description ?? null,
          },
        });

        await SubscriptionModel.findByIdAndUpdate(subscriptionId, { status: 'past_due' });
      }

      return { received: true, event: eventType, subscription: subscriptionId };
    }

    // ---- Customer bill payment path (existing behavior) ----
    const payment = (await PaymentModel.findOne({
      $or: [
        { razorpayOrderId: rzpOrderId },
        { providerPaymentId: rzpOrderId },
      ],
    })) as (IPayment & { _id: mongoose.Types.ObjectId }) | null;

    if (!payment) return { received: true }; // not our payment — ignore

    if (eventType === 'payment.captured') {
      payment.razorpayPaymentId = rzpPaymentId;
      payment.providerPaymentId = rzpPaymentId;
      payment.status = 'COMPLETED' as any;
      payment.verifiedAt = new Date();
      await payment.save();

      // Mark bill and orders as paid
      if (payment.sessionId) {
        await BillingService.verifyPayment(
          payment.restaurantId.toString(),
          payment.sessionId.toString(),
          rzpOrderId,
        );
      }
    }

    if (eventType === 'payment.failed') {
      payment.status = PaymentStatus.FAILED as any;
      payment.failureReason = entity.error_description ?? 'Payment failed';
      await payment.save();
    }

    return { received: true, event: eventType };
  }

  static async markCashPaymentCollected(restaurantId: string, paymentId: string) {
    const payment = await PaymentModel.findOne({
      restaurantId: toObjectId(restaurantId),
      $or: [{ providerPaymentId: paymentId }, { _id: mongoose.Types.ObjectId.isValid(paymentId) ? toObjectId(paymentId) : null }],
      method: PaymentMethod.CASH,
    });

    if (!payment) {
      throw new AppError('Cash payment not found', 404, ErrorCode.NOT_FOUND);
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    if (!payment.sessionId || !payment.providerPaymentId) {
      throw new AppError('Payment cannot be verified automatically', 400, ErrorCode.INVALID_REQUEST);
    }

    await BillingService.verifyPayment(
      restaurantId,
      payment.sessionId.toString(),
      payment.providerPaymentId,
    );

    return PaymentModel.findById(payment._id);
  }
}
