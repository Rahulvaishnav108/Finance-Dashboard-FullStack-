import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import newman from 'newman';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const collectionPath = path.join(backendDir, 'postman', 'collections', 'analytics-module.postman_collection.json');
const environmentPath = path.join(
  backendDir,
  'postman',
  'environments',
  'analytics-module-local.postman_environment.json',
);
const port = 5076;
const baseUrl = `http://127.0.0.1:${port}`;

let builtCryptoPromise = null;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadBuiltCrypto() {
  if (!builtCryptoPromise) {
    builtCryptoPromise = import(pathToFileURL(path.join(backendDir, 'dist', 'utils', 'crypto.js')).href);
  }

  return builtCryptoPromise;
}

async function waitForHealth(url, attempts = 60) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        return;
      }
    } catch {}

    await sleep(1000);
  }

  throw new Error('Backend did not become healthy in time');
}

async function request(url, method, pathname, options = {}) {
  const headers = {
    ...(options.headers ?? {}),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${url}${pathname}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const raw = await response.text();
  let json = null;

  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {
      json = null;
    }
  }

  return {
    status: response.status,
    json,
    raw,
  };
}

async function login(url, email, password, deviceLabel) {
  const response = await request(url, 'POST', '/api/v1/auth/login', {
    body: { email, password, deviceLabel },
  });

  assert(response.status === 200, `Login failed for ${email} with status ${response.status}`);
  assert(response.json?.data?.accessToken, `Access token missing for ${email}`);

  return response.json.data.accessToken;
}

async function runNewmanSuite(url) {
  const environment = JSON.parse(fs.readFileSync(environmentPath, 'utf8'));
  const runtimeEnvironment = {
    ...environment,
    values: environment.values.map((entry) => (entry.key === 'baseUrl' ? { ...entry, value: url } : entry)),
  };

  const summary = await new Promise((resolve, reject) => {
    newman.run(
      {
        collection: collectionPath,
        environment: runtimeEnvironment,
        insecure: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );
  });

  return {
    stats: summary.run.stats,
    failures: summary.run.failures.map((failure) => ({
      source: failure.source?.name ?? failure.parent?.name ?? 'unknown',
      message: failure.error?.message ?? String(failure.error ?? 'Unknown failure'),
    })),
  };
}

async function seedAnalyticsRuntimeData(db) {
  const { hashPassword } = await loadBuiltCrypto();
  const now = new Date();

  const restaurantId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();
  const superAdminId = new mongoose.Types.ObjectId();
  const kitchenStaffOneId = new mongoose.Types.ObjectId();
  const kitchenStaffTwoId = new mongoose.Types.ObjectId();
  const kitchenStaffThreeId = new mongoose.Types.ObjectId();

  const [adminPasswordHash, superAdminPasswordHash, kitchenOnePasswordHash, kitchenTwoPasswordHash, kitchenThreePasswordHash] =
    await Promise.all([
      hashPassword('Analytics@123'),
      hashPassword('AnalyticsSuper@123'),
      hashPassword('Kitchen@123'),
      hashPassword('Kitchen@123'),
      hashPassword('Kitchen@123'),
    ]);

  await db.collection('restaurants').insertOne({
    _id: restaurantId,
    slug: 'analytics-verification-hub',
    name: 'Analytics Verification Hub',
    status: 'ACTIVE',
    plan: 'PRO',
    cuisine: 'Fusion',
    city: 'Delhi',
    rating: 4.8,
    settings: {
      currency: 'INR',
      taxRate: 0.05,
      serviceChargeEnabled: true,
      sessionDurationMinutes: 90,
    },
    createdAt: now,
    updatedAt: now,
  });

  await db.collection('users').insertMany([
    {
      _id: adminId,
      name: 'Analytics Admin',
      email: 'analytics.admin@example.com',
      mobile: '9999911111',
      password: adminPasswordHash,
      role: 'restaurant-admin',
      status: 'ACTIVE',
      restaurantId,
      isEmailVerified: true,
      isMobileVerified: true,
      refreshTokens: [],
      failedLoginAttempts: 0,
      lockUntil: null,
      isDeleted: false,
      deletedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: superAdminId,
      name: 'Analytics Super Admin',
      email: 'analytics.superadmin@example.com',
      mobile: '9999922222',
      password: superAdminPasswordHash,
      role: 'super-admin',
      status: 'ACTIVE',
      restaurantId: null,
      isEmailVerified: true,
      isMobileVerified: true,
      refreshTokens: [],
      failedLoginAttempts: 0,
      lockUntil: null,
      isDeleted: false,
      deletedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: kitchenStaffOneId,
      name: 'Kitchen One',
      email: 'analytics.kitchen.one@example.com',
      mobile: '9999933331',
      password: kitchenOnePasswordHash,
      role: 'kitchen-staff',
      status: 'ACTIVE',
      restaurantId,
      isEmailVerified: true,
      isMobileVerified: true,
      refreshTokens: [],
      failedLoginAttempts: 0,
      lockUntil: null,
      isDeleted: false,
      deletedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: kitchenStaffTwoId,
      name: 'Kitchen Two',
      email: 'analytics.kitchen.two@example.com',
      mobile: '9999933332',
      password: kitchenTwoPasswordHash,
      role: 'kitchen-staff',
      status: 'ACTIVE',
      restaurantId,
      isEmailVerified: true,
      isMobileVerified: true,
      refreshTokens: [],
      failedLoginAttempts: 0,
      lockUntil: null,
      isDeleted: false,
      deletedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: kitchenStaffThreeId,
      name: 'Kitchen Three',
      email: 'analytics.kitchen.three@example.com',
      mobile: '9999933333',
      password: kitchenThreePasswordHash,
      role: 'kitchen-staff',
      status: 'INACTIVE',
      restaurantId,
      isEmailVerified: true,
      isMobileVerified: true,
      refreshTokens: [],
      failedLoginAttempts: 0,
      lockUntil: null,
      isDeleted: false,
      deletedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.collection('tables').insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: 'A1',
      capacity: 4,
      floor: 1,
      section: 'Main',
      assignedStaffId: null,
      status: 'AVAILABLE',
      qrCode: 'analytics-verify-qr-a1',
      isActive: true,
      currentSessionId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: 'A2',
      capacity: 4,
      floor: 1,
      section: 'Main',
      assignedStaffId: null,
      status: 'RESERVED',
      qrCode: 'analytics-verify-qr-a2',
      isActive: true,
      currentSessionId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: 'B1',
      capacity: 6,
      floor: 1,
      section: 'VIP',
      assignedStaffId: null,
      status: 'OCCUPIED',
      qrCode: 'analytics-verify-qr-b1',
      isActive: true,
      currentSessionId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: 'B2',
      capacity: 4,
      floor: 2,
      section: 'VIP',
      assignedStaffId: null,
      status: 'PAYMENT_PENDING',
      qrCode: 'analytics-verify-qr-b2',
      isActive: true,
      currentSessionId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: 'C1',
      capacity: 2,
      floor: 2,
      section: 'Patio',
      assignedStaffId: null,
      status: 'NEEDS_CLEANING',
      qrCode: 'analytics-verify-qr-c1',
      isActive: true,
      currentSessionId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: 'C2',
      capacity: 2,
      floor: 2,
      section: 'Patio',
      assignedStaffId: null,
      status: 'CLEANING_IN_PROGRESS',
      qrCode: 'analytics-verify-qr-c2',
      isActive: true,
      currentSessionId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: 'Z9',
      capacity: 8,
      floor: 3,
      section: 'Archive',
      assignedStaffId: null,
      status: 'AVAILABLE',
      qrCode: 'analytics-verify-qr-z9',
      isActive: false,
      currentSessionId: null,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.collection('bills').insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      orderIds: [new mongoose.Types.ObjectId()],
      customerId: null,
      tableId: null,
      sessionId: null,
      subtotal: 90,
      taxAmount: 10,
      serviceCharge: 0,
      discountAmount: 5,
      finalAmount: 95,
      appliedCoupons: [],
      paymentMethod: 'UPI',
      paymentId: null,
      paymentStatus: 'PAID',
      status: 'PAID',
      requestedAt: null,
      paidAt: new Date('2026-01-05T12:00:00.000Z'),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      orderIds: [new mongoose.Types.ObjectId()],
      customerId: null,
      tableId: null,
      sessionId: null,
      subtotal: 180,
      taxAmount: 20,
      serviceCharge: 0,
      discountAmount: 0,
      finalAmount: 200,
      appliedCoupons: [],
      paymentMethod: 'CARD',
      paymentId: null,
      paymentStatus: 'PAID',
      status: 'PAID',
      requestedAt: null,
      paidAt: new Date('2026-01-12T14:30:00.000Z'),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      orderIds: [new mongoose.Types.ObjectId()],
      customerId: null,
      tableId: null,
      sessionId: null,
      subtotal: 145,
      taxAmount: 15,
      serviceCharge: 0,
      discountAmount: 10,
      finalAmount: 150,
      appliedCoupons: [],
      paymentMethod: 'CASH',
      paymentId: null,
      paymentStatus: 'PAID',
      status: 'PAID',
      requestedAt: null,
      paidAt: new Date('2026-01-12T18:15:00.000Z'),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      orderIds: [new mongoose.Types.ObjectId()],
      customerId: null,
      tableId: null,
      sessionId: null,
      subtotal: 140,
      taxAmount: 10,
      serviceCharge: 0,
      discountAmount: 0,
      finalAmount: 150,
      appliedCoupons: [],
      paymentMethod: 'CASH',
      paymentId: null,
      paymentStatus: 'PAID',
      status: 'PAID',
      requestedAt: null,
      paidAt: new Date('2026-02-03T09:15:00.000Z'),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      orderIds: [new mongoose.Types.ObjectId()],
      customerId: null,
      tableId: null,
      sessionId: null,
      subtotal: 275,
      taxAmount: 25,
      serviceCharge: 0,
      discountAmount: 0,
      finalAmount: 300,
      appliedCoupons: [],
      paymentMethod: 'ONLINE',
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'GENERATED',
      requestedAt: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.collection('customerprofiles').insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      mobile: '9999900001',
      name: 'Aarav',
      totalVisits: 5,
      totalSpent: 4200,
      lastVisitAt: new Date('2026-01-18T19:00:00.000Z'),
      firstVisitAt: new Date('2025-12-20T10:00:00.000Z'),
      restaurantsVisited: [restaurantId],
      tags: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      mobile: '9999900002',
      name: 'Mira',
      totalVisits: 1,
      totalSpent: 850,
      lastVisitAt: new Date('2026-01-10T09:00:00.000Z'),
      firstVisitAt: new Date('2026-01-10T09:00:00.000Z'),
      restaurantsVisited: [restaurantId],
      tags: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      mobile: '9999900003',
      name: 'Kabir',
      totalVisits: 3,
      totalSpent: 2750,
      lastVisitAt: new Date('2026-02-02T21:15:00.000Z'),
      firstVisitAt: new Date('2025-11-02T18:00:00.000Z'),
      restaurantsVisited: [restaurantId],
      tags: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      mobile: '9999900004',
      name: 'Sia',
      totalVisits: 2,
      totalSpent: 1900,
      lastVisitAt: new Date('2026-01-28T20:30:00.000Z'),
      firstVisitAt: new Date('2025-12-28T20:00:00.000Z'),
      restaurantsVisited: [restaurantId],
      tags: [],
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const makeOrderItem = (name, price) => ({
    menuItemId: new mongoose.Types.ObjectId(),
    name,
    quantity: 1,
    price,
    totalPrice: price,
    notes: '',
  });

  await db.collection('orders').insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      customerId: null,
      tableId: null,
      sessionId: null,
      batchId: null,
      orderNumber: 'AN-001',
      items: [makeOrderItem('Paneer Tikka', 95)],
      totalAmount: 90,
      taxAmount: 5,
      discountAmount: 0,
      finalAmount: 95,
      status: 'READY',
      priority: 'NORMAL',
      paymentStatus: 'PAID',
      specialInstructions: '',
      estimatedPreparationTime: null,
      kitchenStaffId: kitchenStaffOneId,
      serviceStaffId: null,
      acceptedAt: new Date('2026-01-05T12:10:00.000Z'),
      preparingStartedAt: null,
      delayedAt: null,
      readyAt: new Date('2026-01-05T12:30:00.000Z'),
      rejectedAt: null,
      pickedAt: null,
      servedAt: null,
      completedAt: null,
      cancelledAt: null,
      rejectionReason: '',
      createdAt: new Date('2026-01-05T12:05:00.000Z'),
      updatedAt: new Date('2026-01-05T12:30:00.000Z'),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      customerId: null,
      tableId: null,
      sessionId: null,
      batchId: null,
      orderNumber: 'AN-002',
      items: [makeOrderItem('Pasta', 130)],
      totalAmount: 120,
      taxAmount: 10,
      discountAmount: 0,
      finalAmount: 130,
      status: 'REJECTED',
      priority: 'NORMAL',
      paymentStatus: 'PENDING',
      specialInstructions: '',
      estimatedPreparationTime: null,
      kitchenStaffId: kitchenStaffOneId,
      serviceStaffId: null,
      acceptedAt: new Date('2026-01-05T12:25:00.000Z'),
      preparingStartedAt: null,
      delayedAt: null,
      readyAt: null,
      rejectedAt: new Date('2026-01-05T12:40:00.000Z'),
      pickedAt: null,
      servedAt: null,
      completedAt: null,
      cancelledAt: null,
      rejectionReason: 'Ingredient unavailable',
      createdAt: new Date('2026-01-05T12:20:00.000Z'),
      updatedAt: new Date('2026-01-05T12:40:00.000Z'),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      customerId: null,
      tableId: null,
      sessionId: null,
      batchId: null,
      orderNumber: 'AN-003',
      items: [makeOrderItem('Burger', 200)],
      totalAmount: 180,
      taxAmount: 20,
      discountAmount: 0,
      finalAmount: 200,
      status: 'READY',
      priority: 'HIGH',
      paymentStatus: 'PAID',
      specialInstructions: '',
      estimatedPreparationTime: null,
      kitchenStaffId: kitchenStaffTwoId,
      serviceStaffId: null,
      acceptedAt: new Date('2026-01-10T14:05:00.000Z'),
      preparingStartedAt: null,
      delayedAt: null,
      readyAt: new Date('2026-01-10T14:30:00.000Z'),
      rejectedAt: null,
      pickedAt: null,
      servedAt: null,
      completedAt: null,
      cancelledAt: null,
      rejectionReason: '',
      createdAt: new Date('2026-01-10T14:00:00.000Z'),
      updatedAt: new Date('2026-01-10T14:30:00.000Z'),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      customerId: null,
      tableId: null,
      sessionId: null,
      batchId: null,
      orderNumber: 'AN-004',
      items: [makeOrderItem('Soup', 150)],
      totalAmount: 135,
      taxAmount: 15,
      discountAmount: 0,
      finalAmount: 150,
      status: 'DELAYED',
      priority: 'NORMAL',
      paymentStatus: 'PENDING',
      specialInstructions: '',
      estimatedPreparationTime: null,
      kitchenStaffId: kitchenStaffTwoId,
      serviceStaffId: null,
      acceptedAt: new Date('2026-02-03T14:15:00.000Z'),
      preparingStartedAt: null,
      delayedAt: new Date('2026-02-03T14:40:00.000Z'),
      readyAt: null,
      rejectedAt: null,
      pickedAt: null,
      servedAt: null,
      completedAt: null,
      cancelledAt: null,
      rejectionReason: '',
      createdAt: new Date('2026-02-03T14:10:00.000Z'),
      updatedAt: new Date('2026-02-03T14:40:00.000Z'),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      customerId: null,
      tableId: null,
      sessionId: null,
      batchId: null,
      orderNumber: 'AN-005',
      items: [makeOrderItem('Biryani', 150)],
      totalAmount: 135,
      taxAmount: 15,
      discountAmount: 0,
      finalAmount: 150,
      status: 'CANCELLED',
      priority: 'NORMAL',
      paymentStatus: 'FAILED',
      specialInstructions: '',
      estimatedPreparationTime: null,
      kitchenStaffId: kitchenStaffOneId,
      serviceStaffId: null,
      acceptedAt: null,
      preparingStartedAt: null,
      delayedAt: null,
      readyAt: null,
      rejectedAt: null,
      pickedAt: null,
      servedAt: null,
      completedAt: null,
      cancelledAt: new Date('2026-01-12T12:50:00.000Z'),
      rejectionReason: '',
      createdAt: new Date('2026-01-12T12:45:00.000Z'),
      updatedAt: new Date('2026-01-12T12:50:00.000Z'),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      customerId: null,
      tableId: null,
      sessionId: null,
      batchId: null,
      orderNumber: 'AN-006',
      items: [makeOrderItem('Pizza', 180)],
      totalAmount: 165,
      taxAmount: 15,
      discountAmount: 0,
      finalAmount: 180,
      status: 'READY',
      priority: 'NORMAL',
      paymentStatus: 'PAID',
      specialInstructions: '',
      estimatedPreparationTime: null,
      kitchenStaffId: kitchenStaffOneId,
      serviceStaffId: null,
      acceptedAt: null,
      preparingStartedAt: new Date('2026-01-20T18:10:00.000Z'),
      delayedAt: null,
      readyAt: new Date('2026-01-20T18:40:00.000Z'),
      rejectedAt: null,
      pickedAt: null,
      servedAt: null,
      completedAt: null,
      cancelledAt: null,
      rejectionReason: '',
      createdAt: new Date('2026-01-20T18:00:00.000Z'),
      updatedAt: new Date('2026-01-20T18:40:00.000Z'),
    },
  ]);

  return {
    restaurantId: restaurantId.toString(),
  };
}

async function runSmokeSuite(url, restaurantId) {
  const results = [];

  async function runStep(name, fn) {
    try {
      const detail = await fn();
      results.push({ name, passed: true, detail: detail ?? '' });
    } catch (error) {
      results.push({
        name,
        passed: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await runStep('admin revenue analytics', async () => {
    const adminToken = await login(url, 'analytics.admin@example.com', 'Analytics@123', 'Analytics Verify Admin');
    const response = await request(url, 'GET', '/api/v1/admin/analytics/revenue?from=2026-01-01&to=2026-01-31&groupBy=day', {
      token: adminToken,
    });

    assert(response.status === 200, `Admin revenue analytics returned ${response.status}`);
    assert(response.json?.data?.summary?.totalRevenue === 445, 'Admin revenue summary totalRevenue mismatch');
    assert(response.json?.data?.revenue?.length === 2, 'Admin revenue periods mismatch');
    return 'Revenue summary and grouped periods matched expected values';
  });

  await runStep('admin peak-hours analytics', async () => {
    const adminToken = await login(url, 'analytics.admin@example.com', 'Analytics@123', 'Analytics Verify Admin Peak');
    const response = await request(url, 'GET', '/api/v1/admin/analytics/peak-hours?from=2026-01-01&to=2026-01-31', {
      token: adminToken,
    });

    assert(response.status === 200, `Admin peak-hours analytics returned ${response.status}`);
    assert(response.json?.data?.summary?.busiestHour === 12, 'Peak-hours busiestHour mismatch');
    assert(response.json?.data?.summary?.totalOrders === 4, 'Peak-hours totalOrders mismatch');
    return 'Peak hours summary matched expected values';
  });

  await runStep('admin table-utilization analytics', async () => {
    const adminToken = await login(url, 'analytics.admin@example.com', 'Analytics@123', 'Analytics Verify Admin Tables');
    const response = await request(url, 'GET', '/api/v1/admin/analytics/table-utilization', {
      token: adminToken,
    });

    assert(response.status === 200, `Admin table-utilization returned ${response.status}`);
    assert(response.json?.data?.summary?.totalTables === 6, 'Table-utilization totalTables mismatch');
    assert(response.json?.data?.sectionBreakdown?.length === 4, 'Table-utilization section breakdown mismatch');
    return 'Table utilization summary matched expected values';
  });

  await runStep('super-admin revenue analytics', async () => {
    const superAdminToken = await login(
      url,
      'analytics.superadmin@example.com',
      'AnalyticsSuper@123',
      'Analytics Verify Super Admin',
    );
    const response = await request(
      url,
      'GET',
      `/api/v1/admin/analytics/revenue?restaurantId=${restaurantId}&groupBy=month`,
      {
        token: superAdminToken,
      },
    );

    assert(response.status === 200, `Super-admin revenue analytics returned ${response.status}`);
    assert(response.json?.data?.revenue?.[0]?.period === '2026-01', 'Super-admin first period mismatch');
    assert(response.json?.data?.revenue?.[1]?.period === '2026-02', 'Super-admin second period mismatch');
    return 'Super-admin cross-tenant analytics lookup matched expected values';
  });

  await runStep('analytics validation and auth guards', async () => {
    const adminToken = await login(url, 'analytics.admin@example.com', 'Analytics@123', 'Analytics Verify Admin Guard');
    const superAdminToken = await login(
      url,
      'analytics.superadmin@example.com',
      'AnalyticsSuper@123',
      'Analytics Verify Super Guard',
    );

    const [invalidRange, missingAuth, missingContext] = await Promise.all([
      request(url, 'GET', '/api/v1/admin/analytics/revenue?from=2026-02-01&to=2026-01-01', {
        token: adminToken,
      }),
      request(url, 'GET', '/api/v1/admin/analytics/revenue'),
      request(url, 'GET', '/api/v1/admin/analytics/revenue', {
        token: superAdminToken,
      }),
    ]);

    assert(invalidRange.status === 400, `Invalid range status mismatch: ${invalidRange.status}`);
    assert(invalidRange.json?.error?.code === 'VALIDATION_ERROR', 'Invalid range error code mismatch');
    assert(missingAuth.status === 401, `Missing auth status mismatch: ${missingAuth.status}`);
    assert(missingContext.status === 403, `Missing context status mismatch: ${missingContext.status}`);
    return 'Validation and auth guard responses matched expected values';
  });

  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  return {
    passed,
    failed,
    results,
  };
}

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'restaurant-automation-analytics-verify',
    },
  });

  let verifyConnection = null;
  let server = null;
  let stdout = '';
  let stderr = '';

  try {
    verifyConnection = await mongoose
      .createConnection(mongod.getUri(), {
        serverSelectionTimeoutMS: 5000,
      })
      .asPromise();

    assert(verifyConnection.db, 'Verification database connection is unavailable');
    const seeded = await seedAnalyticsRuntimeData(verifyConnection.db);

    server = spawn(process.execPath, [path.join(backendDir, 'dist', 'server.js')], {
      cwd: backendDir,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: String(port),
        API_PREFIX: '/api/v1',
        MONGODB_URI: mongod.getUri(),
        MONGODB_CONNECT_TIMEOUT_MS: '5000',
        ALLOW_NO_DB: 'false',
        SEED_ON_STARTUP: 'false',
        JWT_SECRET: 'analytics-verify-secret',
        JWT_REFRESH_SECRET: 'analytics-verify-refresh-secret',
        COOKIE_SECRET: 'analytics-verify-cookie-secret',
        CORS_ORIGIN: 'http://localhost:5173',
        SOCKET_CORS_ORIGIN: 'http://localhost:5173',
        ENABLE_REQUEST_LOGS: 'false',
        HELMET_ENABLED: 'false',
        TRUST_PROXY: 'false',
        RATE_LIMIT_MAX: '1000',
        RATE_LIMIT_MAX_REQUESTS: '1000',
        AUTH_RATE_LIMIT_MAX_REQUESTS: '200',
        SMTP_HOST: '',
        SMTP_USER: '',
        SMTP_PASS: '',
        SMTP_FROM: 'noreply@example.com',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    server.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    server.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    await waitForHealth(baseUrl);

    const smoke = await runSmokeSuite(baseUrl, seeded.restaurantId);
    const postman = await runNewmanSuite(baseUrl);

    const summary = {
      smoke,
      postman,
    };

    console.log(JSON.stringify(summary, null, 2));

    if (smoke.failed > 0 || postman.failures.length > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          fatal: true,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          serverLogs: {
            stdout,
            stderr,
          },
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } finally {
    if (server) {
      server.kill('SIGTERM');
      await new Promise((resolve) => server.on('exit', resolve));
    }
    await verifyConnection?.close();
    await mongod.stop();
  }
}

await main();
