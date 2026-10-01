import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { PaymentMethod } from '../billing/billing.schema';
import { PaymentsService } from './payments.service';
import type { ListPaymentsQuery } from './payments.schema';

function requireTableSession(req: Request) {
  if (!req.tableSession) {
    throw new AppError('Session required', 401, ErrorCode.UNAUTHORIZED);
  }

  return req.tableSession;
}

function requireRestaurantUser(req: Request) {
  const restaurantId = req.user?.restaurantId;
  if (!restaurantId) {
    throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
  }

  return restaurantId;
}

export async function createCustomerPaymentController(req: Request, res: Response, next: NextFunction) {
  try {
    const session = requireTableSession(req);
    const method = (req.body.paymentMethod ?? req.body.method) as PaymentMethod;
    const data = await PaymentsService.createCustomerPayment(session.restaurantId, session._id, method);

    ok(res, data, 201);
  } catch (error) {
    next(error);
  }
}

export async function verifyCustomerPaymentController(req: Request, res: Response, next: NextFunction) {
  try {
    const session = requireTableSession(req);

    // Extract Razorpay fields if present (sent by frontend after checkout)
    const razorpayFields =
      req.body.razorpay_order_id &&
      req.body.razorpay_payment_id &&
      req.body.razorpay_signature
        ? {
            razorpay_order_id:  req.body.razorpay_order_id  as string,
            razorpay_payment_id: req.body.razorpay_payment_id as string,
            razorpay_signature:  req.body.razorpay_signature  as string,
          }
        : undefined;

    const data = await PaymentsService.verifyCustomerPayment(
      session.restaurantId,
      session._id,
      req.body.paymentId,
      req.body.simulateStatus,
      razorpayFields,
    );

    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getCustomerPaymentStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const session = requireTableSession(req);
    const data = await PaymentsService.getCustomerPaymentStatus(
      session.restaurantId,
      session._id,
      req.params.paymentId,
    );

    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function listCustomerPaymentsController(req: Request, res: Response, next: NextFunction) {
  try {
    const session = requireTableSession(req);
    const data = await PaymentsService.listCustomerPayments(session.restaurantId, session._id);

    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function listRestaurantPaymentsController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = requireRestaurantUser(req);
    const data = await PaymentsService.listRestaurantPayments(restaurantId, req.query as unknown as ListPaymentsQuery);

    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getRestaurantPaymentSummaryController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = requireRestaurantUser(req);
    const data = await PaymentsService.getRestaurantPaymentSummary(restaurantId, req.query as unknown as ListPaymentsQuery);

    ok(res, data);
  } catch (error) {
    next(error);
  }
}

export async function markCashPaymentCollectedController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = requireRestaurantUser(req);
    const payment = await PaymentsService.markCashPaymentCollected(restaurantId, req.params.paymentId);

    ok(res, { payment });
  } catch (error) {
    next(error);
  }
}

export async function razorpayWebhookController(req: Request, res: Response, next: NextFunction) {
  try {
    const signature    = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

    if (!signature) {
      throw new AppError('Missing Razorpay signature header', 400, ErrorCode.INVALID_REQUEST);
    }

    // req.body is raw Buffer here (express.raw middleware applied in routes)
    const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);

    const result = await PaymentsService.handleRazorpayWebhook(rawBody, signature, webhookSecret);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function refundPaymentController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = requireRestaurantUser(req);
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await PaymentsService.refundPayment(
      restaurantId,
      paymentId,
      amount,
      reason,
    );

    ok(res, { payment });
  } catch (error) {
    next(error);
  }
}
