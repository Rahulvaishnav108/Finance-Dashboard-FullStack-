import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { TableModel } from '../../modules/tables/tables.model';
import { TableSessionModel } from '../../modules/tableSessions/tableSessions.model';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { Notification } from '../../modules/notifications/notifications.model';
import { socketService } from '../../sockets/socket.service';
import { UserRole } from '../../constants/roles';
import { NotificationCategory, NotificationPriority } from '../../modules/notifications/notifications.schema';
import { TableStatus, SessionStatus, RestaurantStatus } from '../../constants/statuses';
import { SocketEvent } from '../../constants/events';
import { ErrorCode } from '../../constants/errors';

describe('Customer Requests Integration Tests', () => {
  let dummyRestaurantId: mongoose.Types.ObjectId;
  let dummyTableId: mongoose.Types.ObjectId;
  let dummySessionId: mongoose.Types.ObjectId;
  let dummySessionToken: string;

  beforeEach(async () => {
    // Spy on and mock all socket emissions to prevent side-effects and allow assertions
    jest.spyOn(socketService, 'emitToRestaurant').mockImplementation(() => {});
    jest.spyOn(socketService, 'emitToRole').mockImplementation(() => {});
    jest.spyOn(socketService, 'emitToSession').mockImplementation(() => {});
    jest.spyOn(socketService, 'emitToUser').mockImplementation(() => {});

    // Seed database with required restaurant-table-session hierarchy
    dummyRestaurantId = new mongoose.Types.ObjectId();

    await RestaurantModel.create({
      _id: dummyRestaurantId,
      slug: `restaurant-${dummyRestaurantId.toString()}`,
      name: 'Test Restaurant',
      status: RestaurantStatus.ACTIVE,
      plan: 'pro',
      cuisine: 'Indian',
      city: 'Delhi',
      settings: {
        currency: 'INR',
        taxRate: 0.05,
        serviceChargeEnabled: true,
        sessionDurationMinutes: 90,
      },
    });

    const table = await TableModel.create({
      restaurantId: dummyRestaurantId,
      tableNumber: '12',
      capacity: 4,
      status: TableStatus.OCCUPIED,
      qrCode: `QR-restaurant-${dummyRestaurantId.toString()}-table-12`,
      qrToken: `QR-restaurant-${dummyRestaurantId.toString()}-table-12-token`,
      isActive: true,
    });
    dummyTableId = table._id as mongoose.Types.ObjectId;

    dummySessionToken = 'test-session-token-123456';
    const session = await TableSessionModel.create({
      restaurantId: dummyRestaurantId,
      tableId: dummyTableId,
      customerName: 'Alice Smith',
      mobile: '1234567890',
      sessionToken: dummySessionToken,
      sessionStart: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour hard expiry
      status: SessionStatus.ACTIVE,
      lastActivityAt: new Date(),
    });
    dummySessionId = session._id as mongoose.Types.ObjectId;

    // Link table to the active session
    table.currentSessionId = dummySessionId;
    await table.save();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Helper for requests
  const makeRequest = (endpoint: string, body: object, token: string | null = dummySessionToken) => {
    const req = request(app).post(endpoint);
    if (token) {
      req.set('x-session-token', token);
    }
    return req.send(body);
  };

  describe('Session Boundary & Middleware Validations', () => {
    it('should return 401 and SESSION_INVALID if x-session-token header is missing', async () => {
      const res = await makeRequest('/api/v1/customer/requests', { type: 'waiter' }, null);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(ErrorCode.SESSION_INVALID);
      expect(res.body.error.message).toContain('Session token required');
    });

    it('should return 401 and SESSION_INVALID if session token is invalid/non-existent', async () => {
      const res = await makeRequest('/api/v1/customer/requests', { type: 'waiter' }, 'invalid-token-abc');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(ErrorCode.SESSION_INVALID);
    });

    it('should return 401 and TABLE_SESSION_EXPIRED if session status is CLOSED', async () => {
      await TableSessionModel.findByIdAndUpdate(dummySessionId, { status: SessionStatus.CLOSED });

      const res = await makeRequest('/api/v1/customer/requests', { type: 'waiter' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(ErrorCode.SESSION_INVALID);
    });

    it('should return 401 and TABLE_SESSION_EXPIRED if session has hit hard expiry', async () => {
      // Set expiresAt to past
      await TableSessionModel.findByIdAndUpdate(dummySessionId, {
        expiresAt: new Date(Date.now() - 1000),
      });

      const res = await makeRequest('/api/v1/customer/requests', { type: 'waiter' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(ErrorCode.TABLE_SESSION_EXPIRED);
    });

    it('should return 401 and SESSION_IDLE_TIMEOUT if session was idle too long', async () => {
      // Set lastActivityAt to long time ago (e.g. 5 hours ago)
      await TableSessionModel.findByIdAndUpdate(dummySessionId, {
        lastActivityAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      });

      const res = await makeRequest('/api/v1/customer/requests', { type: 'waiter' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe(ErrorCode.SESSION_IDLE_TIMEOUT);
    });
  });

  describe('Unified Customer Request Endpoint: POST /api/v1/customer/requests', () => {
    it('should successfully create a "waiter" request, persist in DB, and emit to socket rooms', async () => {
      const res = await makeRequest('/api/v1/customer/requests', { type: 'waiter' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Waiter Call submitted successfully');
      expect(res.body.data).toBeDefined();

      const notificationId = res.body.data._id;
      expect(notificationId).toBeDefined();

      // Verify DB persistence
      const dbNotification = await Notification.findById(notificationId);
      expect(dbNotification).toBeTruthy();
      expect(dbNotification!.restaurantId.toString()).toBe(dummyRestaurantId.toString());
      expect(dbNotification!.tableSessionId!.toString()).toBe(dummySessionId.toString());
      expect(dbNotification!.title).toBe('Waiter Requested');
      expect(dbNotification!.message).toBe('Table 12 is requesting a waiter.');
      expect(dbNotification!.type).toBe('CALL_WAITER');
      expect(dbNotification!.category).toBe(NotificationCategory.STAFF);
      expect(dbNotification!.recipientRole).toBe(UserRole.SERVICE_STAFF);
      expect(dbNotification!.priority).toBe(NotificationPriority.HIGH);

      // Verify real-time socket events emission
      expect(socketService.emitToRole).toHaveBeenCalledWith(
        dummyRestaurantId.toString(),
        UserRole.SERVICE_STAFF,
        SocketEvent.NOTIFICATION_NEW,
        expect.any(Object)
      );
      expect(socketService.emitToSession).toHaveBeenCalledWith(
        dummySessionId.toString(),
        SocketEvent.NOTIFICATION_NEW,
        expect.any(Object)
      );
      expect(socketService.emitToRestaurant).toHaveBeenCalledWith(
        dummyRestaurantId.toString(),
        SocketEvent.NOTIFICATION_NEW,
        expect.any(Object)
      );
    });

    it('should successfully create a "cleaning" request, targeting CLEANING_STAFF', async () => {
      const res = await makeRequest('/api/v1/customer/requests', { type: 'cleaning' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const dbNotification = await Notification.findById(res.body.data._id);
      expect(dbNotification).toBeTruthy();
      expect(dbNotification!.type).toBe('REQUEST_CLEANING');
      expect(dbNotification!.category).toBe(NotificationCategory.CLEANING);
      expect(dbNotification!.recipientRole).toBe(UserRole.CLEANING_STAFF);
      expect(dbNotification!.priority).toBe(NotificationPriority.NORMAL);

      expect(socketService.emitToRole).toHaveBeenCalledWith(
        dummyRestaurantId.toString(),
        UserRole.CLEANING_STAFF,
        SocketEvent.NOTIFICATION_NEW,
        expect.any(Object)
      );
    });

    it('should return 400 validation error if type is missing or invalid', async () => {
      const res1 = await makeRequest('/api/v1/customer/requests', {});
      expect(res1.status).toBe(400);
      expect(res1.body.success).toBe(false);

      const res2 = await makeRequest('/api/v1/customer/requests', { type: 'invalid-type-name' });
      expect(res2.status).toBe(400);
      expect(res2.body.success).toBe(false);
      expect(res2.body.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });
  });

  describe('Semantic Customer Request Endpoints', () => {
    it('should successfully create a waiter request via POST /api/v1/customer/requests/waiter', async () => {
      const res = await makeRequest('/api/v1/customer/requests/waiter', {});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Waiter Call submitted successfully');
      expect(res.body.data.type).toBe('CALL_WAITER');
      expect(res.body.data.recipientRole).toBe(UserRole.SERVICE_STAFF);
      expect(res.body.data.priority).toBe(NotificationPriority.HIGH);
    });

    it('should successfully create a water request via POST /api/v1/customer/requests/water', async () => {
      const res = await makeRequest('/api/v1/customer/requests/water', {});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Water Request submitted successfully');
      expect(res.body.data.type).toBe('REQUEST_WATER');
      expect(res.body.data.recipientRole).toBe(UserRole.SERVICE_STAFF);
      expect(res.body.data.priority).toBe(NotificationPriority.NORMAL);
    });

    it('should successfully create a cutlery request via POST /api/v1/customer/requests/cutlery', async () => {
      const res = await makeRequest('/api/v1/customer/requests/cutlery', {});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cutlery Request submitted successfully');
      expect(res.body.data.type).toBe('REQUEST_CUTLERY');
      expect(res.body.data.recipientRole).toBe(UserRole.SERVICE_STAFF);
      expect(res.body.data.priority).toBe(NotificationPriority.NORMAL);
    });

    it('should successfully create a cleaning request via POST /api/v1/customer/requests/cleaning', async () => {
      const res = await makeRequest('/api/v1/customer/requests/cleaning', {});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cleaning Request submitted successfully');
      expect(res.body.data.type).toBe('REQUEST_CLEANING');
      expect(res.body.data.recipientRole).toBe(UserRole.CLEANING_STAFF);
      expect(res.body.data.priority).toBe(NotificationPriority.NORMAL);
    });

    it('should successfully create a help request via POST /api/v1/customer/requests/help', async () => {
      const res = await makeRequest('/api/v1/customer/requests/help', {});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Help/Other Request submitted successfully');
      expect(res.body.data.type).toBe('REQUEST_HELP');
      expect(res.body.data.recipientRole).toBe(UserRole.SERVICE_STAFF);
      expect(res.body.data.priority).toBe(NotificationPriority.NORMAL);
    });
  });

  describe('Spam Protection / Sliding 60-Second Window Deduplication', () => {
    it('should return the existing active notification when an identical request is sent within 60s', async () => {
      // 1. Submit first request
      const res1 = await makeRequest('/api/v1/customer/requests/waiter', {});
      expect(res1.status).toBe(201);
      const firstNotificationId = res1.body.data._id;
      expect(firstNotificationId).toBeDefined();

      // Reset mock spy call counters
      jest.clearAllMocks();

      // 2. Submit second identical request immediately
      const res2 = await makeRequest('/api/v1/customer/requests/waiter', {});
      expect(res2.status).toBe(201); // Deduplicated request returns 201 with success: true

      // Verify the returned notification document ID is identical
      const secondNotificationId = res2.body.data._id;
      expect(secondNotificationId).toBe(firstNotificationId);

      // Verify socket service emissions were NOT triggered a second time
      expect(socketService.emitToRole).not.toHaveBeenCalled();
      expect(socketService.emitToRestaurant).not.toHaveBeenCalled();
      expect(socketService.emitToSession).not.toHaveBeenCalled();
    });

    it('should create a new notification if the previous one was created more than 60s ago', async () => {
      // 1. Submit first request
      const res1 = await makeRequest('/api/v1/customer/requests/waiter', {});
      const firstNotificationId = res1.body.data._id;

      // 2. Manually backdate the first notification in the database to 61 seconds ago
      await Notification.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(firstNotificationId) },
        { $set: { createdAt: new Date(Date.now() - 61 * 1000) } }
      );

      // Reset mock spy call counters
      jest.clearAllMocks();

      // 3. Submit second request
      const res2 = await makeRequest('/api/v1/customer/requests/waiter', {});
      expect(res2.status).toBe(201);

      const secondNotificationId = res2.body.data._id;
      expect(secondNotificationId).not.toBe(firstNotificationId); // Different ID created!

      // Verify socket emissions were triggered for the new notification
      expect(socketService.emitToRole).toHaveBeenCalled();
    });
  });
});
