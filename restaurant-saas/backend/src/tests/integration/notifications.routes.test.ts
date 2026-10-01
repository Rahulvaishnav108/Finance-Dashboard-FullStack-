import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { ErrorCode } from '../../constants/errors';
import { UserRole } from '../../constants/roles';
import { RestaurantStatus } from '../../constants/statuses';
import { Notification } from '../../modules/notifications/notifications.model';
import {
  NotificationCategory,
  NotificationPriority,
} from '../../modules/notifications/notifications.schema';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { signAccessToken } from '../../services/jwt.service';

function createToken(
  userId: string,
  role: UserRole,
  restaurantId: string
): string {
  return signAccessToken({
    _id: userId,
    email: `${role}@example.com`,
    role,
    restaurantId,
  });
}

describe('Notifications routes', () => {
  let restaurantId: mongoose.Types.ObjectId;
  let otherRestaurantId: mongoose.Types.ObjectId;
  let serviceUnreadId: mongoose.Types.ObjectId;
  let cleaningUnreadId: mongoose.Types.ObjectId;

  let serviceToken: string;
  let cleaningToken: string;
  let adminToken: string;

  beforeEach(async () => {
    restaurantId = new mongoose.Types.ObjectId();
    otherRestaurantId = new mongoose.Types.ObjectId();

    await RestaurantModel.create([
      {
        _id: restaurantId,
        slug: `notifications-${restaurantId.toString()}`,
        name: 'Notifications Hub',
        status: RestaurantStatus.ACTIVE,
        plan: 'PRO',
        cuisine: 'Indian',
        city: 'Delhi',
      },
      {
        _id: otherRestaurantId,
        slug: `notifications-${otherRestaurantId.toString()}`,
        name: 'Other Restaurant',
        status: RestaurantStatus.ACTIVE,
        plan: 'PRO',
        cuisine: 'Italian',
        city: 'Mumbai',
      },
    ]);

    const [serviceUnread, , cleaningUnread] = await Notification.create([
      {
        restaurantId,
        recipientRole: UserRole.SERVICE_STAFF,
        title: 'Service request pending',
        message: 'A guest requested support.',
        type: 'SERVICE_ALERT',
        category: NotificationCategory.STAFF,
        priority: NotificationPriority.HIGH,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      {
        restaurantId,
        recipientRole: UserRole.SERVICE_STAFF,
        title: 'Service request completed',
        message: 'A previous request was completed.',
        type: 'SERVICE_DONE',
        category: NotificationCategory.STAFF,
        priority: NotificationPriority.NORMAL,
        isRead: true,
        readAt: new Date(),
        readBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      {
        restaurantId,
        recipientRole: UserRole.CLEANING_STAFF,
        title: 'Cleaning needed',
        message: 'Table 7 needs cleaning.',
        type: 'CLEANING_ALERT',
        category: NotificationCategory.CLEANING,
        priority: NotificationPriority.NORMAL,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    ]);

    serviceUnreadId = serviceUnread._id as mongoose.Types.ObjectId;
    cleaningUnreadId = cleaningUnread._id as mongoose.Types.ObjectId;

    await Notification.create([
      {
        restaurantId,
        recipientRole: UserRole.SERVICE_STAFF,
        title: 'Expired service notification',
        message: 'Old notification should not be returned.',
        type: 'EXPIRED_SERVICE',
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.LOW,
        expiresAt: new Date(Date.now() - 60 * 1000),
      },
      {
        restaurantId: otherRestaurantId,
        recipientRole: UserRole.SERVICE_STAFF,
        title: 'Foreign tenant notification',
        message: 'Should stay hidden by tenant scope.',
        type: 'FOREIGN_SERVICE',
        category: NotificationCategory.STAFF,
        priority: NotificationPriority.NORMAL,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    ]);

    serviceToken = createToken('507f1f77bcf86cd799439011', UserRole.SERVICE_STAFF, restaurantId.toString());
    cleaningToken = createToken('507f1f77bcf86cd799439012', UserRole.CLEANING_STAFF, restaurantId.toString());
    adminToken = createToken('507f1f77bcf86cd799439013', UserRole.RESTAURANT_ADMIN, restaurantId.toString());
  });

  it('lists only active notifications scoped to the current staff role by default', async () => {
    const response = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.notifications).toHaveLength(2);
    expect(response.body.data.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Service request pending', read: false }),
        expect.objectContaining({ title: 'Service request completed', read: true }),
      ]),
    );
    expect(
      response.body.data.notifications.some((notification: { title: string }) => notification.title === 'Cleaning needed'),
    ).toBe(false);
    expect(response.body.data.meta).toMatchObject({
      count: 2,
      unreadCount: 1,
      recipientRole: UserRole.SERVICE_STAFF,
      isRead: null,
    });
  });

  it('lets admin filter notifications by documented query params', async () => {
    const response = await request(app)
      .get('/api/v1/notifications?recipientRole=service-staff&isRead=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.notifications).toHaveLength(1);
    expect(response.body.data.notifications[0]).toMatchObject({
      title: 'Service request completed',
      read: true,
    });
    expect(response.body.data.meta).toMatchObject({
      count: 1,
      unreadCount: 1,
      recipientRole: UserRole.SERVICE_STAFF,
      isRead: true,
    });
  });

  it('blocks staff from querying notifications for another role', async () => {
    const response = await request(app)
      .get('/api/v1/notifications?recipientRole=cleaning-staff')
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('marks one accessible notification as read', async () => {
    const response = await request(app)
      .patch(`/api/v1/notifications/${serviceUnreadId.toString()}/read`)
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.notification).toMatchObject({
      read: true,
      title: 'Service request pending',
    });

    const updated = await Notification.findById(serviceUnreadId).lean();
    expect(updated?.isRead).toBe(true);
    expect(updated?.readAt).toBeTruthy();
    expect(String(updated?.readBy)).toBe('507f1f77bcf86cd799439011');
  });

  it('does not allow staff to mark another role notification as read', async () => {
    const response = await request(app)
      .patch(`/api/v1/notifications/${cleaningUnreadId.toString()}/read`)
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('marks only scoped notifications as read in bulk', async () => {
    const response = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      updatedCount: 1,
      recipientRole: UserRole.SERVICE_STAFF,
    });

    const [updatedService, unchangedCleaning] = await Promise.all([
      Notification.findById(serviceUnreadId).lean(),
      Notification.findById(cleaningUnreadId).lean(),
    ]);

    expect(updatedService?.isRead).toBe(true);
    expect(unchangedCleaning?.isRead).toBe(false);
  });

  it('blocks staff from bulk-reading another role notifications', async () => {
    const response = await request(app)
      .patch('/api/v1/notifications/read-all?role=cleaning-staff')
      .set('Authorization', `Bearer ${serviceToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('validates notification id params', async () => {
    const response = await request(app)
      .patch('/api/v1/notifications/not-an-object-id/read')
      .set('Authorization', `Bearer ${cleaningToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe(ErrorCode.VALIDATION_ERROR);
  });
});
