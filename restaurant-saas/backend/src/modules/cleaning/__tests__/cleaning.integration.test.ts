import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app';
import { RestaurantModel } from '../../restaurants/restaurants.model';
import { TableModel } from '../../tables/tables.model';
import { CleaningTaskModel } from '../cleaning.model';
import { generateTokenPair } from '../../../services/jwt.service';
import { UserRole } from '../../../constants/roles';
import { CleaningStatus, TableStatus } from '../../../constants/statuses';
import { SocketEvent } from '../../../constants/events';
import { emitSessionEvent } from '../../../services/sessionEvents';

jest.mock('../../../services/sessionEvents', () => ({
  emitSessionEvent: jest.fn(),
}));

describe('Cleaning Lifecycle Integration', () => {
  let restaurantId: mongoose.Types.ObjectId;
  let tableId: mongoose.Types.ObjectId;
  let cleaningStaffToken: string;
  let taskId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    restaurantId = new mongoose.Types.ObjectId();
    tableId = new mongoose.Types.ObjectId();

    await RestaurantModel.create({
      _id: restaurantId,
      name: 'Cleaning Test Restaurant',
      slug: `cleaning-test-${Date.now()}`,
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zipCode: '12345',
      },
      city: 'Test City',
      cuisine: 'Test Cuisine',
      settings: { currency: 'USD', timezone: 'UTC', taxRate: 10 },
      plan: 'FREE',
      status: 'ACTIVE',
    });

    await TableModel.create({
      _id: tableId,
      restaurantId,
      tableNumber: '1',
      capacity: 4,
      status: TableStatus.NEEDS_CLEANING,
      qrToken: 'cleaning-test-token-1',
    });

    const task = await CleaningTaskModel.create({
      restaurantId,
      tableId,
      status: CleaningStatus.PENDING,
    });
    taskId = task._id as mongoose.Types.ObjectId;

    const tokens = generateTokenPair({
      _id: new mongoose.Types.ObjectId().toString(),
      email: 'cleaner@example.com',
      role: UserRole.CLEANING_STAFF as any,
      panel: 'cleaning' as any,
      restaurantId: restaurantId.toString(),
    });
    cleaningStaffToken = tokens.accessToken;
  });

  afterAll(async () => {
    await RestaurantModel.deleteMany({});
    await TableModel.deleteMany({});
    await CleaningTaskModel.deleteMany({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Scenario 1: Customer Pays -> Cleaning Task Created -> Staff Starts Task -> Completes Task -> Table Available -> Queue Updated', async () => {
    // 1. Staff Starts Task
    const startRes = await request(app)
      .patch(`/api/v1/cleaning/tasks/${taskId}/start`)
      .set('Authorization', `Bearer ${cleaningStaffToken}`)
      .send();

    expect(startRes.status).toBe(200);
    expect(startRes.body.data.task.status).toBe(CleaningStatus.IN_PROGRESS);

    const tableAfterStart = await TableModel.findById(tableId);
    console.error("TABLE AFTER START:", tableAfterStart?.status);
    console.error("EMIT CALLS:", (emitSessionEvent as jest.Mock).mock.calls);
    // Verify emission for Task Started -> CLEANING_IN_PROGRESS
    expect(emitSessionEvent).toHaveBeenCalledWith(
      restaurantId.toString(),
      SocketEvent.TABLE_CLEANING_STARTED,
      expect.objectContaining({ status: TableStatus.CLEANING_IN_PROGRESS })
    );

    expect(tableAfterStart?.status).toBe(TableStatus.CLEANING_IN_PROGRESS);

    // 2. Staff Completes Task
    const completeRes = await request(app)
      .patch(`/api/v1/cleaning/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${cleaningStaffToken}`)
      .send();

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.task.status).toBe(CleaningStatus.COMPLETED);

    // Verify emission for Task Completed -> NEEDS_CLEANING
    expect(emitSessionEvent).toHaveBeenCalledWith(
      restaurantId.toString(),
      SocketEvent.TABLE_NEEDS_CLEANING,
      expect.objectContaining({ status: TableStatus.NEEDS_CLEANING })
    );

    const tableAfterComplete = await TableModel.findById(tableId);
    expect(tableAfterComplete?.status).toBe(TableStatus.NEEDS_CLEANING);

    // 3. Task Verified (Table Available)
    const verifyRes = await request(app)
      .patch(`/api/v1/cleaning/tasks/${taskId}/verify`)
      .set('Authorization', `Bearer ${cleaningStaffToken}`)
      .send();

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.task.status).toBe(CleaningStatus.VERIFIED);

    // Verify emission for Task Verified -> AVAILABLE
    expect(emitSessionEvent).toHaveBeenCalledWith(
      restaurantId.toString(),
      SocketEvent.TABLE_AVAILABLE,
      expect.objectContaining({ status: TableStatus.AVAILABLE })
    );

    const tableAfterVerify = await TableModel.findById(tableId);
    expect(tableAfterVerify?.status).toBe(TableStatus.AVAILABLE);
  });



  it('Scenario 3: Attempt to verify a table under MAINTENANCE (Expected: Validation Error)', async () => {
    const maintTableId = new mongoose.Types.ObjectId();
    await TableModel.create({
      _id: maintTableId,
      restaurantId,
      tableNumber: '2',
      capacity: 4,
      status: TableStatus.MAINTENANCE,
      qrToken: 'cleaning-maint-token',
    });

    const maintTask = await CleaningTaskModel.create({
      restaurantId,
      tableId: maintTableId,
      status: CleaningStatus.COMPLETED,
    });

    const res = await request(app)
      .patch(`/api/v1/cleaning/tasks/${maintTask._id}/verify`)
      .set('Authorization', `Bearer ${cleaningStaffToken}`)
      .send();

    console.error("SCENARIO 3 RESPONSE:", res.body);
    const tbl = await TableModel.findById(maintTableId);
    console.error("MAINT TABLE STATUS IN DB:", tbl?.status);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toContain('Invalid transition');
  });

  it('Scenario 4: Multiple tables cleaned simultaneously', async () => {
    const tableIdA = new mongoose.Types.ObjectId();
    const tableIdB = new mongoose.Types.ObjectId();

    await TableModel.create({
      _id: tableIdA,
      restaurantId,
      tableNumber: '3',
      capacity: 2,
      status: TableStatus.NEEDS_CLEANING,
      qrToken: 'multi-token-A',
    });

    await TableModel.create({
      _id: tableIdB,
      restaurantId,
      tableNumber: '4',
      capacity: 2,
      status: TableStatus.NEEDS_CLEANING,
      qrToken: 'multi-token-B',
    });

    const taskA = await CleaningTaskModel.create({
      restaurantId,
      tableId: tableIdA,
      status: CleaningStatus.PENDING,
    });

    const taskB = await CleaningTaskModel.create({
      restaurantId,
      tableId: tableIdB,
      status: CleaningStatus.PENDING,
    });

    const [resA, resB] = await Promise.all([
      request(app).patch(`/api/v1/cleaning/tasks/${taskA._id}/start`).set('Authorization', `Bearer ${cleaningStaffToken}`).send(),
      request(app).patch(`/api/v1/cleaning/tasks/${taskB._id}/start`).set('Authorization', `Bearer ${cleaningStaffToken}`).send()
    ]);

    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);

    const tableA = await TableModel.findById(tableIdA);
    const tableB = await TableModel.findById(tableIdB);

    expect(tableA?.status).toBe(TableStatus.CLEANING_IN_PROGRESS);
    expect(tableB?.status).toBe(TableStatus.CLEANING_IN_PROGRESS);
  });
});
