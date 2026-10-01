import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app'; // Assumes app is exported from src/app.ts or similar
import { TableModel } from '../tables/tables.model';
import { TableSessionModel } from '../tableSessions/tableSessions.model';
import { OrderModel } from '../orders/orders.model';
import { CleaningTaskModel } from '../cleaning/cleaning.model';
import { BillingModel } from '../billing/billing.model';
import { RestaurantModel } from '../restaurants/restaurants.model';
import { PaymentModel } from './payments.model';
import { TableStatus, SessionStatus, OrderStatus, CleaningStatus } from '../../constants/statuses';
import { UserRole } from '../../constants/roles';
import { generateTokenPair } from '../../services/jwt.service';
import { PaymentMethod } from '../billing/billing.schema';

// Setup Mock for emitSessionEvent
jest.mock('../../services/sessionEvents', () => ({
  emitSessionEvent: jest.fn(),
}));

import { emitSessionEvent } from '../../services/sessionEvents';

describe('Payment Lifecycle Integration', () => {
  let restaurantId: mongoose.Types.ObjectId;
  let tableId: mongoose.Types.ObjectId;
  let sessionId: mongoose.Types.ObjectId;
  let customerToken: string;
  let mockBillId: mongoose.Types.ObjectId;
  let mockPaymentIntentId: string;

  beforeAll(async () => {
    // Setup test data
    restaurantId = new mongoose.Types.ObjectId();
    tableId = new mongoose.Types.ObjectId();
    sessionId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await mongoose.connection.db?.dropDatabase();

    await RestaurantModel.create({
      _id: restaurantId,
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      city: 'Test City',
      cuisine: 'Test Cuisine',
      plan: 'FREE',
      status: 'ACTIVE',
    });

    await TableModel.create({
      _id: tableId,
      restaurantId,
      tableNumber: '1',
      qrCode: 'qr-123',
      qrToken: 'token-123',
      status: TableStatus.OCCUPIED,
      currentSessionId: sessionId,
      isActive: true,
      capacity: 4,
    });

    await TableSessionModel.create({
      _id: sessionId,
      restaurantId,
      tableId,
      sessionToken: 'session-token-123',
      status: SessionStatus.ACTIVE,
      customerName: 'Test Customer',
      mobile: '9999999999',
      sessionStart: new Date(),
      expiresAt: new Date(Date.now() + 1000000),
      lastActivityAt: new Date(),
    });

    const tokens = generateTokenPair({
      _id: sessionId.toString(),
      email: 'customer@example.com',
      role: UserRole.CUSTOMER as any,
      panel: 'customer' as any,
      restaurantId: restaurantId.toString(),
    });
    customerToken = tokens.accessToken;

    const order = await OrderModel.create({
      restaurantId,
      sessionId,
      tableId,
      orderNumber: 1001,
      status: OrderStatus.SERVED,
      items: [{ menuItemId: new mongoose.Types.ObjectId(), name: 'Test Item', price: 100, quantity: 1, totalPrice: 100 }],
      totalAmount: 100,
      taxAmount: 5,
      discountAmount: 0,
      finalAmount: 105,
    });

    mockBillId = new mongoose.Types.ObjectId();
    mockPaymentIntentId = `pay_mock_${restaurantId}_${Date.now()}`;

    await BillingModel.create({
      _id: mockBillId,
      restaurantId,
      sessionId,
      orderIds: [order._id],
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      paymentMethod: PaymentMethod.ONLINE,
      paymentId: mockPaymentIntentId,
      subtotal: 100,
      taxAmount: 5,
      serviceCharge: 0,
      discountAmount: 0,
      finalAmount: 105,
    });

    await PaymentModel.create({
      restaurantId,
      sessionId,
      orderId: order._id,
      billId: mockBillId,
      providerPaymentId: mockPaymentIntentId,
      status: 'PENDING',
      method: PaymentMethod.ONLINE,
      amount: 105,
      currency: 'INR',
    });
  });

  it('Scenario 1: Payment Success -> Session Closed -> Cleaning Task Created', async () => {
    const res = await request(app)
      .post('/api/v1/payments/customer/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('x-session-token', 'session-token-123')
      .send({
        paymentId: mockPaymentIntentId,
        simulateStatus: 'COMPLETED',
      });

    expect(res.status).toBe(200);

    const session = await TableSessionModel.findById(sessionId);
    expect(session?.status).toBe(SessionStatus.CLOSED);

    const table = await TableModel.findById(tableId);
    expect(table?.status).toBe(TableStatus.NEEDS_CLEANING);
    expect(table?.currentSessionId).toBeNull();

    const task = await CleaningTaskModel.findOne({ tableId, restaurantId });
    expect(task).toBeDefined();
    expect(task?.status).toBe(CleaningStatus.PENDING);
  });

  it('Scenario 2: Payment Success -> Customer cannot place new orders', async () => {
    await request(app)
      .post('/api/v1/payments/customer/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('x-session-token', 'session-token-123')
      .send({ paymentId: mockPaymentIntentId, simulateStatus: 'COMPLETED' });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('x-session-token', 'session-token-123')
      .send({
        items: [{ menuItemId: new mongoose.Types.ObjectId(), quantity: 1 }],
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('Scenario 3: Payment Success -> Table appears in Cleaning Dashboard', async () => {
    await request(app)
      .post('/api/v1/payments/customer/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('x-session-token', 'session-token-123')
      .send({ paymentId: mockPaymentIntentId, simulateStatus: 'COMPLETED' });

    const task = await CleaningTaskModel.findOne({ tableId, status: CleaningStatus.PENDING });
    expect(task).toBeTruthy();
  });

  it('Scenario 4: Payment Success -> Queue receives table availability updates', async () => {
    await request(app)
      .post('/api/v1/payments/customer/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('x-session-token', 'session-token-123')
      .send({ paymentId: mockPaymentIntentId, simulateStatus: 'COMPLETED' });

    expect(emitSessionEvent).toHaveBeenCalledWith(
      restaurantId.toString(),
      'table.session.closed',
      expect.objectContaining({ reason: 'Bill paid successfully' })
    );

    expect(emitSessionEvent).toHaveBeenCalledWith(
      restaurantId.toString(),
      'table.status.changed',
      expect.objectContaining({ status: TableStatus.NEEDS_CLEANING })
    );
  });
});
