// src/modules/notifications/notifications.routes.ts
// REST routes for staff/admin notification operations

import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { NotificationsController } from './notifications.controller';
import {
  markAllNotificationsQuerySchema,
  notificationIdParamSchema,
  notificationsListQuerySchema,
} from './notifications.validation';

const router = Router();

// Secure all endpoints in this router
router.use(requireAuth);

router.get('/', validate({ query: notificationsListQuerySchema }), NotificationsController.getNotifications);
router.patch('/read-all', validate({ query: markAllNotificationsQuerySchema }), NotificationsController.markAllAsRead);
router.patch('/:id/read', validate({ params: notificationIdParamSchema }), NotificationsController.markAsRead);

export default router;
