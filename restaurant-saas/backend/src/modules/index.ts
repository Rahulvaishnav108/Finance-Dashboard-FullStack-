import { Router } from 'express';
import { roles } from '../constants/roles';
import {
  requireAuth,
  authenticateStaff,
  authenticateKitchen,
  authenticateCleaning,
  authenticateAdmin,
  authenticateSuperAdmin,
} from '../middleware/requireAuth';
import { roleGuard } from '../middleware/roleGuard';
import { authRouter } from './routes/auth.routes';
import { publicRouter } from './routes/public.routes';
import { customerRouter } from './routes/customer.routes';
import { staffRouter } from './routes/staff.routes';
import { kitchenRouter } from './routes/kitchen.routes';
import cleaningRouter from './cleaning/cleaning.routes';
import { adminRouter } from './routes/admin.routes';
import { superAdminRouter } from './routes/superAdmin.routes';
import { sharedRouter } from './routes/shared.routes';
import usersRouter from './users/users.routes';
import { tenantGuard } from '../middleware/tenantGuard';
import { requirePasswordChange } from '../middleware/requirePasswordChange';
import menuRouter from './menu/menu.routes';
import ordersRouter from './orders/orders.routes';
import cartRouter from './cart/cart.routes';
import auditLogRoutes from '../modules/auditLogs/auditLogs.routes';
import feedbackRouter from './feedback/feedback.routes';
import loyaltyRouter from './loyalty/loyalty.routes';
import paymentsRouter from './payments/payments.routes';
import restaurantsRouter from './restaurants/restaurants.routes';
import subscriptionRoutes from './subscriptions/subscriptions.routes';

export const apiRouter = Router();

apiRouter.use(requirePasswordChange);

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/audit-logs', requireAuth, roleGuard(roles.restaurantAdmin, roles.superAdmin), auditLogRoutes);
apiRouter.use('/public', publicRouter);
apiRouter.use(restaurantsRouter);
apiRouter.use(menuRouter);
apiRouter.use(ordersRouter);
apiRouter.use(loyaltyRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/subscriptions', requireAuth, subscriptionRoutes);
apiRouter.use('/customer/cart', cartRouter);
apiRouter.use('/customer/feedback', feedbackRouter);
apiRouter.use('/customer', customerRouter);
apiRouter.use('/staff', authenticateStaff, roleGuard(roles.serviceStaff, roles.restaurantAdmin), tenantGuard, staffRouter);
apiRouter.use('/kitchen', authenticateKitchen, roleGuard(roles.kitchenStaff, roles.restaurantAdmin), tenantGuard, kitchenRouter);
apiRouter.use('/cleaning', authenticateCleaning, roleGuard(roles.cleaningStaff, roles.restaurantAdmin), tenantGuard, cleaningRouter);
apiRouter.use('/admin', authenticateAdmin, roleGuard(roles.restaurantAdmin, roles.superAdmin), tenantGuard, adminRouter);
apiRouter.use('/super-admin', authenticateSuperAdmin, roleGuard(roles.superAdmin), superAdminRouter);
apiRouter.use('/', requireAuth, sharedRouter);