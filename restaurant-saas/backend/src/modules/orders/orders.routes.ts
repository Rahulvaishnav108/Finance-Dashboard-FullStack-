// src/modules/orders/orders.routes.ts
// Order route definitions — session-based customer + JWT staff/kitchen

import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireSession } from '../../middleware/requireSession';
import { roleGuard } from '../../middleware/roleGuard';
import { UserRole } from '../../constants/roles';
import { validate } from '../../middleware/validate';
import {
  placeOrderBodySchema,
  orderIdParamsSchema,
  customerOrdersQuerySchema,
} from './orders.schema';
import { OrdersController } from './orders.controller';

const router = Router();



// Place Order
router.post(
  '/customer/orders',
  requireSession,
  validate({ body: placeOrderBodySchema }),
  OrdersController.placeOrder
);

// Get Orders
router.get('/customer/orders', requireSession, validate({ query: customerOrdersQuerySchema }), OrdersController.getOrders);

// Get Single Order
router.get('/customer/orders/:id', requireSession, validate({ params: orderIdParamsSchema }), OrdersController.getSingleOrder);

// Reorder
router.post(
  '/customer/orders/:id/reorder',
  requireSession,
  validate({ params: orderIdParamsSchema }),
  OrdersController.reorder
);

// Cancel Order
router.post(
  '/customer/orders/:id/cancel',
  requireSession,
  validate({ params: orderIdParamsSchema }),
  OrdersController.cancelOrder
);



/*
|--------------------------------------------------------------------------
| SERVICE STAFF ORDER APIs (JWT auth — service staff + admin)
|--------------------------------------------------------------------------
*/

const serviceRoles = [UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN];

// Ready Orders Queue
router.get('/staff/orders/ready', requireAuth, roleGuard(...serviceRoles), OrdersController.getReadyOrders);

// Pick Food
router.patch(
  '/staff/orders/:id/pick',
  requireAuth,
  roleGuard(...serviceRoles),
  validate({ params: orderIdParamsSchema }),
  OrdersController.pickFood
);

// Mark Served
router.patch(
  '/staff/orders/:id/serve',
  requireAuth,
  roleGuard(...serviceRoles),
  validate({ params: orderIdParamsSchema }),
  OrdersController.markServed
);

router.patch(
  '/staff/orders/:id/complete',
  requireAuth,
  roleGuard(...serviceRoles),
  validate({ params: orderIdParamsSchema }),
  OrdersController.markCompleted
);

export default router;
