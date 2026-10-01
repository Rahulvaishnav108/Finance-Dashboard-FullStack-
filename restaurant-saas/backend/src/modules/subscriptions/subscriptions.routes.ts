import { Router } from 'express';
import { z } from 'zod';
import * as controller from './subscriptions.controller';
import { validate } from '../../middleware/validate';
import { createSubscriptionSchema, updateSubscriptionSchema, subscriptionIdParam, lifecycleActionSchema, renewSchema, usageUpdateSchema, billingOrderSchema } from './subscriptions.schema';

import { roleGuard } from '../../middleware/roleGuard';
import { UserRole } from '../../constants/roles';

const router = Router();
const superAdminOnly = roleGuard(UserRole.SUPER_ADMIN);
const restaurantAdminAndSuper = roleGuard(UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN);

router.post('/', superAdminOnly, validate({ body: createSubscriptionSchema }), controller.create);
router.get('/', superAdminOnly, controller.list);
router.get('/current', restaurantAdminAndSuper, controller.getCurrent);
router.get('/:id', superAdminOnly, validate({ params: subscriptionIdParam }), controller.getOne);
router.patch('/:id', superAdminOnly, validate({ params: subscriptionIdParam, body: updateSubscriptionSchema }), controller.patch);
router.post(
	'/:id/status',
	superAdminOnly,
	validate({ params: subscriptionIdParam, body: z.object({ status: z.enum(['active', 'cancelled', 'past_due', 'suspended']) }) }),
	controller.setStatus,
);

router.post('/:id/activate', superAdminOnly, validate({ params: subscriptionIdParam, body: lifecycleActionSchema }), controller.activate);
router.post('/:id/cancel', superAdminOnly, validate({ params: subscriptionIdParam, body: lifecycleActionSchema }), controller.cancel);
router.post('/:id/renew', superAdminOnly, validate({ params: subscriptionIdParam, body: renewSchema }), controller.renew);

// Upgrade / Downgrade / Expire lifecycle
router.post(
  '/:id/upgrade',
  superAdminOnly,
  validate({ params: subscriptionIdParam, body: updateSubscriptionSchema }),
  controller.upgrade,
);
router.post(
  '/:id/downgrade',
  superAdminOnly,
  validate({ params: subscriptionIdParam, body: updateSubscriptionSchema }),
  controller.downgrade,
);
router.post(
  '/:id/expire',
  superAdminOnly,
  validate({ params: subscriptionIdParam, body: lifecycleActionSchema }),
  controller.expire,
);

router.get('/:id/usage', superAdminOnly, validate({ params: subscriptionIdParam }), controller.getUsage);
router.get('/:id/usage/report', superAdminOnly, validate({ params: subscriptionIdParam }), controller.getUsageReport);
router.patch('/:id/usage', superAdminOnly, validate({ params: subscriptionIdParam, body: usageUpdateSchema }), controller.incrementUsage);
router.get('/:id/history', superAdminOnly, validate({ params: subscriptionIdParam }), controller.history);
router.post('/:id/billing/order', restaurantAdminAndSuper, validate({ params: subscriptionIdParam, body: billingOrderSchema }), controller.createBillingOrder);

export default router;
