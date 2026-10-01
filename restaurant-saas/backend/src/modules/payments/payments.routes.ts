import { Router } from 'express';
import express from 'express';
import { UserRole } from '../../constants/roles';
import { requireAuth } from '../../middleware/requireAuth';
import { requireSession } from '../../middleware/requireSession';
import { roleGuard } from '../../middleware/roleGuard';
import { tenantGuard } from '../../middleware/tenantGuard';
import { validate } from '../../middleware/validate';
import {
  createCustomerPaymentController,
  getCustomerPaymentStatusController,
  getRestaurantPaymentSummaryController,
  listCustomerPaymentsController,
  listRestaurantPaymentsController,
  markCashPaymentCollectedController,
  verifyCustomerPaymentController,
  razorpayWebhookController,
  refundPaymentController,
} from './payments.controller';
import {
  createPaymentBodySchema,
  listPaymentsQuerySchema,
  paymentIdParamsSchema,
  verifyPaymentBodySchema,
} from './payments.schema';

const router = Router();
const billingRoles = [UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN];

/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
| Must be FIRST and use express.raw() — Razorpay sends raw body for signature.
| No auth middleware — verified via Razorpay signature instead.
|--------------------------------------------------------------------------
*/
router.post(
  '/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  razorpayWebhookController,
);

/*
|--------------------------------------------------------------------------
| CUSTOMER PAYMENT APIs
|--------------------------------------------------------------------------
*/

router.post(
  '/customer/create',
  requireSession,
  validate({ body: createPaymentBodySchema }),
  createCustomerPaymentController,
);

router.post(
  '/customer/verify',
  requireSession,
  validate({ body: verifyPaymentBodySchema }),
  verifyCustomerPaymentController,
);

router.get('/customer', requireSession, listCustomerPaymentsController);

router.get(
  '/customer/:paymentId/status',
  requireSession,
  validate({ params: paymentIdParamsSchema }),
  getCustomerPaymentStatusController,
);

/*
|--------------------------------------------------------------------------
| ADMIN PAYMENT APIs
|--------------------------------------------------------------------------
*/

router.get(
  '/admin',
  requireAuth,
  roleGuard(...billingRoles),
  tenantGuard,
  validate({ query: listPaymentsQuerySchema }),
  listRestaurantPaymentsController,
);

router.get(
  '/admin/summary',
  requireAuth,
  roleGuard(...billingRoles),
  tenantGuard,
  validate({ query: listPaymentsQuerySchema }),
  getRestaurantPaymentSummaryController,
);

router.patch(
  '/admin/:paymentId/collect-cash',
  requireAuth,
  roleGuard(...billingRoles),
  tenantGuard,
  validate({ params: paymentIdParamsSchema }),
  markCashPaymentCollectedController,
);

router.post(
  '/admin/:paymentId/refund',
  requireAuth,
  roleGuard(UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  tenantGuard,
  validate({ params: paymentIdParamsSchema }),
  refundPaymentController,
);

export default router;
