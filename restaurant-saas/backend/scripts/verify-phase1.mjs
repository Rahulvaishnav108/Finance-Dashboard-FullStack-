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
const collectionPath = path.join(
  backendDir,
  'postman',
  'collections',
  'restaurant-automation-api.postman_collection.json',
);
const environmentPath = path.join(
  backendDir,
  'postman',
  'environments',
  'restaurant-automation-local.postman_environment.json',
);
const port = 5075;
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

function getId(entity) {
  return entity?.id ?? entity?._id ?? null;
}

function last(array) {
  return Array.isArray(array) && array.length > 0 ? array[array.length - 1] : null;
}

async function loadBuiltCrypto() {
  if (!builtCryptoPromise) {
    builtCryptoPromise = import(pathToFileURL(path.join(backendDir, 'dist', 'utils', 'crypto.js')).href);
  }

  return builtCryptoPromise;
}

async function createKnownOtp(db, identifier, type) {
  await db.collection('otps').deleteMany({ identifier, type });
  const { generateOTP, hashPassword } = await loadBuiltCrypto();
  const otp = generateOTP(6);
  const otpHash = await hashPassword(otp);

  await db.collection('otps').insertOne({
    identifier,
    type,
    otpHash,
    attempts: 0,
    blockedUntil: null,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    createdAt: new Date(),
  });

  return otp;
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000);
  const headers = {
    ...(options.headers ?? {}),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.sessionToken) {
    headers['x-session-token'] = options.sessionToken;
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${url}${pathname}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
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

    try {
      const sanitizedHeaders = { ...headers };
      if (sanitizedHeaders.Authorization) {
        sanitizedHeaders.Authorization = sanitizedHeaders.Authorization.slice(0, 20) + '...';
      }
      if (sanitizedHeaders['x-session-token']) {
        sanitizedHeaders['x-session-token'] = sanitizedHeaders['x-session-token'].slice(0, 15) + '...';
      }
      const logPath = path.join(backendDir, 'logs', 'audit_execution_traffic.log');
      fs.appendFileSync(
        logPath,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            method,
            pathname,
            headers: sanitizedHeaders,
            body: options.body,
            status: response.status,
            response: json ?? raw,
          },
          null,
          2
        ) + '\n,\n'
      );
    } catch {}

    return {
      status: response.status,
      json,
      raw,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function login(url, email, password, deviceLabel) {
  const response = await request(url, 'POST', '/api/v1/auth/login', {
    body: { email, password, deviceLabel },
  });

  assert(response.status === 200, `Login failed for ${email} with status ${response.status}`);
  assert(response.json?.data?.accessToken, `Access token missing for ${email}`);
  assert(response.json?.data?.refreshToken, `Refresh token missing for ${email}`);

  return {
    accessToken: response.json.data.accessToken,
    refreshToken: response.json.data.refreshToken,
    user: response.json.data.user,
  };
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

  const failures = summary.run.failures.map((failure) => ({
    source: failure.source?.name ?? failure.parent?.name ?? 'unknown',
    message: failure.error?.message ?? String(failure.error ?? 'Unknown failure'),
  }));

  return {
    stats: summary.run.stats,
    failures,
  };
}

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

async function runSmokeSuite(url, db) {
  const results = [];
  const state = {
    admin: null,
    customer: null,
    staff: null,
    kitchen: null,
    cleaning: null,
    superAdmin: null,
    tempUser: null,
    restaurantId: '',
    createdTableId: '',
    createdQrToken: '',
    createdSessionId: '',
    createdSessionToken: '',
    createdSessionExpiresAt: '',
    idleExpiryTableId: '',
    idleExpiryQrToken: '',
    idleExpirySessionToken: '',
    hardExpiryTableId: '',
    hardExpiryQrToken: '',
    hardExpirySessionToken: '',
    createdCartItemId: '',
    createdOrderId: '',
    reorderedOrderId: '',
    cancelCandidateOrderId: '',
    createdPaymentId: '',
    createdFeedbackId: '',
    createdBatchId: '',
    createdPlanId: '',
    createdRequestId: '',
    createdCleaningRequestId: '',
    queueId: '',
    reservationId: '',
    readyOrderId: '',
    cleaningTaskId: '',
    notificationId: '',
    featureFlagId: '',
    pendingRestaurantId: '',
    createdAdminStaffId: '',
    createdStaffShiftId: '',
    createdOfferId: '',
    createdInventoryItemId: '',
    createdUploadUrl: '',
    createdUploadFileName: '',
  };

  const tablesCollection = db.collection('tables');
  const tableSessionsCollection = db.collection('tableSessions');
  const cleaningTasksCollection = db.collection('cleaningTasks');
  const menuCategoriesCollection = db.collection('menuCategories');
  const menuItemsCollection = db.collection('menuItems');
  const staffRequestsCollection = db.collection('staffRequests');
  const auditLogsCollection = db.collection('auditLogs');
  const ordersCollection = db.collection('orders');
  const notificationsCollection = db.collection('notifications');

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

  async function getTableDocument(tableId) {
    return tablesCollection.findOne({ _id: toObjectId(tableId) });
  }

  async function getSessionDocumentByToken(sessionToken) {
    return tableSessionsCollection.findOne({ sessionToken });
  }

  async function getLatestCleaningTask(tableId) {
    return cleaningTasksCollection.findOne(
      { tableId: toObjectId(tableId) },
      { sort: { createdAt: -1 } },
    );
  }

  async function getOrderDocument(orderId) {
    return ordersCollection.findOne({ _id: toObjectId(orderId) });
  }

  async function getStaffRequestDocument(requestId) {
    return staffRequestsCollection.findOne({ _id: toObjectId(requestId) });
  }

  async function getLatestAuditLog(action, entityId) {
    const entityFilter = entityId
      ? (() => {
          const normalizedId = String(entityId);
          return mongoose.Types.ObjectId.isValid(normalizedId)
            ? { $or: [{ entityId: normalizedId }, { entityId: toObjectId(normalizedId) }] }
            : { entityId: normalizedId };
        })()
      : {};

    return auditLogsCollection.findOne(
      {
        action,
        ...entityFilter,
      },
      { sort: { createdAt: -1 } },
    );
  }

  function assertAscending(values, message) {
    for (let index = 1; index < values.length; index += 1) {
      assert(values[index - 1] <= values[index], message);
    }
  }

  async function createTableWithQr({ name, number, floor, section, capacity }) {
    const createTable = await request(url, 'POST', '/api/v1/admin/tables', {
      token: state.admin.accessToken,
      body: { name, number, floor, section, capacity },
    });
    assert(createTable.status === 201, `create table ${name} returned ${createTable.status}`);

    const tableId = getId(createTable.json?.data?.table);
    assert(tableId, `Created table id missing for ${name}`);

    const generateQr = await request(url, 'POST', `/api/v1/admin/tables/${tableId}/qr`, {
      token: state.admin.accessToken,
    });
    assert(generateQr.status === 200, `generate qr for ${name} returned ${generateQr.status}`);

    const qrToken = generateQr.json?.data?.qrToken;
    assert(qrToken, `QR token missing for ${name}`);

    return { tableId, qrToken };
  }

  await runStep('system routes', async () => {
    for (const pathname of ['/health', '/ready', '/api/v1', '/version']) {
      const response = await request(url, 'GET', pathname);
      assert(response.status === 200, `${pathname} returned ${response.status}`);
    }
  });

  await runStep('auth login role matrix', async () => {
    state.admin = await login(url, 'admin@ambertable.com', 'Admin@123', 'Phase1 Verify Admin');
    state.customer = await login(url, 'guest@ambertable.com', 'Guest@123', 'Phase1 Verify Customer');
    state.staff = await login(url, 'staff@ambertable.com', 'Staff@123', 'Phase1 Verify Staff');
    state.kitchen = await login(url, 'kitchen@ambertable.com', 'Kitchen@123', 'Phase1 Verify Kitchen');
    state.cleaning = await login(url, 'cleaning@ambertable.com', 'Cleaning@123', 'Phase1 Verify Cleaning');
    state.superAdmin = await login(url, 'superadmin@graphura.com', 'Super@123', 'Phase1 Verify Super Admin');
  });

  await runStep('auth me sessions refresh logout otp', async () => {
    const me = await request(url, 'GET', '/api/v1/auth/me', { token: state.admin.accessToken });
    assert(me.status === 200, `auth/me returned ${me.status}`);
    assert((me.json?.data?.user ?? me.json?.data)?.role === 'restaurant-admin', 'auth/me role mismatch');

    const sessions = await request(url, 'GET', '/api/v1/auth/sessions', { token: state.admin.accessToken });
    assert(sessions.status === 200, `auth/sessions returned ${sessions.status}`);
    const sessionId = sessions.json?.data?.sessions?.[0]?.id ?? sessions.json?.data?.sessions?.[0]?._id;
    assert(sessionId, 'No revokable auth session found');

    const revoke = await request(url, 'DELETE', `/api/v1/auth/sessions/${sessionId}`, {
      token: state.admin.accessToken,
    });
    assert(revoke.status === 200, `revoke session returned ${revoke.status}`);

    const refresh = await request(url, 'POST', '/api/v1/auth/refresh', {
      body: { refreshToken: state.customer.refreshToken },
    });
    assert(refresh.status === 200, `refresh returned ${refresh.status}`);
    state.customer.accessToken = refresh.json?.data?.accessToken;
    state.customer.refreshToken = refresh.json?.data?.refreshToken;

    const logout = await request(url, 'POST', '/api/v1/auth/logout', {
      token: state.customer.accessToken,
      body: { refreshToken: state.customer.refreshToken },
    });
    assert(logout.status === 200, `logout returned ${logout.status}`);

    state.customer = await login(url, 'guest@ambertable.com', 'Guest@123', 'Phase1 Verify Customer Relogin');

    const customerMobile = '9999999999';
    const otpRequest = await request(url, 'POST', '/api/v1/auth/request-otp', {
      body: { mobile: customerMobile },
    });
    assert(otpRequest.status === 200, `request-otp returned ${otpRequest.status}`);
    assert(otpRequest.json?.data?.otpSent === true, 'request-otp did not confirm otpSent');
    const otp = await createKnownOtp(db, customerMobile, 'mobile');

    const otpVerify = await request(url, 'POST', '/api/v1/auth/verify-otp', {
      body: { mobile: customerMobile, otp },
    });
    assert(otpVerify.status === 200, `verify-otp returned ${otpVerify.status}`);
    assert(otpVerify.json?.data?.customerId, 'verify-otp response did not include customerId');
  });

  await runStep('auth register user lifecycle', async () => {
    const timestamp = Date.now();
    const tempEmail = `phase1-user-${timestamp}@example.com`;
    const initialPassword = 'Phase1@123';
    const changedPassword = 'Phase1@456';
    const resetPassword = 'Phase1@789';

    const register = await request(url, 'POST', '/api/v1/auth/register', {
      body: {
        name: 'Phase1 Temp User',
        email: tempEmail,
        mobile: `9${String(timestamp).slice(-9)}`,
        password: initialPassword,
      },
    });
    assert(register.status === 201, `register returned ${register.status}`);
    assert(register.json?.data?.refreshToken, 'register refresh token missing');

    let temp = await login(url, tempEmail, initialPassword, 'Phase1 Temp Login');
    state.tempUser = temp;

    const updateProfile = await request(url, 'PATCH', '/api/v1/users/me', {
      token: temp.accessToken,
      body: { name: 'Phase1 Temp User Updated' },
    });
    assert(updateProfile.status === 200, `update profile returned ${updateProfile.status}`);

    const changePassword = await request(url, 'PATCH', '/api/v1/users/me/password', {
      token: temp.accessToken,
      body: { currentPassword: initialPassword, newPassword: changedPassword },
    });
    assert(changePassword.status === 200, `change password returned ${changePassword.status}`);

    temp = await login(url, tempEmail, changedPassword, 'Phase1 Temp Login Changed Password');

    const forgot = await request(url, 'POST', '/api/v1/auth/forgot-password', {
      body: { email: tempEmail },
    });
    assert(forgot.status === 200, `forgot-password returned ${forgot.status}`);
    assert(forgot.json?.data?.otpSent === true, 'forgot-password did not confirm otpSent');
    const otp = await createKnownOtp(db, tempEmail, 'email');

    const verifyReset = await request(url, 'POST', '/api/v1/auth/verify-reset-otp', {
      body: { email: tempEmail, otp },
    });
    assert(verifyReset.status === 200, `verify-reset-otp returned ${verifyReset.status}`);
    const resetToken = verifyReset.json?.data?.resetToken;
    assert(resetToken, 'reset token missing in verify-reset-otp response');

    const reset = await request(url, 'POST', '/api/v1/auth/reset-password', {
      body: { resetToken, newPassword: resetPassword },
    });
    assert(reset.status === 200, `reset-password returned ${reset.status}`);

    temp = await login(url, tempEmail, resetPassword, 'Phase1 Temp Login Reset Password');

    const deleteAccount = await request(url, 'DELETE', '/api/v1/users/me', {
      token: temp.accessToken,
      body: { confirmText: 'DELETE MY ACCOUNT' },
    });
    assert(deleteAccount.status === 200, `delete account returned ${deleteAccount.status}`);
  });

  await runStep('public and admin bootstrap flow', async () => {
    const uniqueTableNumber = (Date.now() % 1000) + 100;
    const restaurant = await request(url, 'GET', '/api/v1/public/restaurants/amber-table');
    assert(restaurant.status === 200, `public restaurant returned ${restaurant.status}`);
    state.restaurantId = getId(restaurant.json?.data?.restaurant);
    assert(state.restaurantId, 'Public restaurant id missing');

    const publicMenuRoot = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}`);
    assert(publicMenuRoot.status === 200, `public menu root returned ${publicMenuRoot.status}`);

    const publicMenu = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}/items`);
    assert(publicMenu.status === 200, `public menu returned ${publicMenu.status}`);

    const availability = await request(
      url,
      'GET',
      `/api/v1/public/reservations/availability?restaurantId=${state.restaurantId}&date=2026-05-20&guests=2`,
    );
    assert(availability.status === 200, `reservation availability returned ${availability.status}`);

    const queueJoin = await request(url, 'POST', '/api/v1/public/queue/join', {
      body: { restaurantId: state.restaurantId, customerName: 'Queue Guest', guests: 3 },
    });
    assert(queueJoin.status === 201, `queue join returned ${queueJoin.status}`);
    state.queueId = getId(queueJoin.json?.data?.queueEntry);
    assert(state.queueId, 'Queue id missing');

    const overview = await request(url, 'GET', '/api/v1/admin/restaurant/overview', {
      token: state.admin.accessToken,
    });
    assert(overview.status === 200, `admin overview returned ${overview.status}`);

    const settings = await request(url, 'GET', '/api/v1/admin/restaurant/settings', {
      token: state.admin.accessToken,
    });
    assert(settings.status === 200, `admin settings returned ${settings.status}`);

    const updateSettings = await request(url, 'PATCH', '/api/v1/admin/restaurant/settings', {
      token: state.admin.accessToken,
      body: { sessionDurationMinutes: 120, serviceChargeEnabled: false },
    });
    assert(updateSettings.status === 200, `admin settings patch returned ${updateSettings.status}`);

    const primaryTable = await createTableWithQr({
      name: `VERIFY-T${uniqueTableNumber}`,
      number: uniqueTableNumber,
      floor: 2,
      section: 'Verify',
      capacity: 4,
    });
    state.createdTableId = primaryTable.tableId;
    state.createdQrToken = primaryTable.qrToken;

    const idleExpiryTable = await createTableWithQr({
      name: `VERIFY-IDLE-${uniqueTableNumber + 1}`,
      number: uniqueTableNumber + 1,
      floor: 2,
      section: 'Verify Session',
      capacity: 4,
    });
    state.idleExpiryTableId = idleExpiryTable.tableId;
    state.idleExpiryQrToken = idleExpiryTable.qrToken;

    const hardExpiryTable = await createTableWithQr({
      name: `VERIFY-HARD-${uniqueTableNumber + 2}`,
      number: uniqueTableNumber + 2,
      floor: 2,
      section: 'Verify Session',
      capacity: 4,
    });
    state.hardExpiryTableId = hardExpiryTable.tableId;
    state.hardExpiryQrToken = hardExpiryTable.qrToken;

    const listTables = await request(url, 'GET', '/api/v1/admin/tables', {
      token: state.admin.accessToken,
    });
    assert(listTables.status === 200, `list tables returned ${listTables.status}`);

    const getTable = await request(url, 'GET', `/api/v1/admin/tables/${state.createdTableId}`, {
      token: state.admin.accessToken,
    });
    assert(getTable.status === 200, `get table returned ${getTable.status}`);

    const updateTable = await request(url, 'PATCH', `/api/v1/admin/tables/${state.createdTableId}`, {
      token: state.admin.accessToken,
      body: { section: 'Verify Updated', capacity: 6 },
    });
    assert(updateTable.status === 200, `update table returned ${updateTable.status}`);

    const bulkCreate = await request(url, 'POST', '/api/v1/admin/tables/bulk', {
      token: state.admin.accessToken,
      body: {
        tables: [
          { name: 'VERIFY-T2', number: 82, floor: 1, section: 'Verify', capacity: 2 },
          { name: 'VERIFY-T3', number: 83, floor: 1, section: 'Verify', capacity: 2 },
        ],
      },
    });
    assert(bulkCreate.status === 201, `bulk create tables returned ${bulkCreate.status}`);

    const getQr = await request(url, 'GET', `/api/v1/admin/tables/${state.createdTableId}/qr`, {
      token: state.admin.accessToken,
    });
    assert(getQr.status === 200, `get qr returned ${getQr.status}`);

    const createSession = await request(url, 'POST', '/api/v1/public/table-session/create', {
      body: {
        token: state.createdQrToken,
        customerName: 'Phase1 Guest',
        mobile: '9876543210',
        partySize: 2,
      },
    });
    assert(createSession.status === 201, `create table session returned ${createSession.status}`);
    state.createdSessionId = getId(createSession.json?.data?.session) ?? createSession.json?.data?.sessionId ?? '';
    state.createdSessionToken =
      createSession.json?.data?.session?.token ?? createSession.json?.data?.sessionToken ?? '';
    state.createdSessionExpiresAt =
      createSession.json?.data?.session?.expiresAt ?? createSession.json?.data?.expiresAt ?? '';
    assert(state.createdSessionId, 'Created session id missing');
    assert(state.createdSessionToken, 'Created session token missing');
    assert(state.createdSessionExpiresAt, 'Created session expiry missing');

    const validateSession = await request(url, 'POST', '/api/v1/public/table-session/validate', {
      body: { token: state.createdSessionToken },
    });
    assert(validateSession.status === 200, `validate table session returned ${validateSession.status}`);
  });

  await runStep('rahul admin CRUD routes', async () => {
    const timestamp = Date.now();
    const staffEmail = `phase1.staff.${timestamp}@example.com`;
    const staffMobile = `8${String(timestamp).slice(-9)}`;
    const offerCode = `P1${String(timestamp).slice(-6)}`;
    const inventoryName = `Phase1 Inventory ${timestamp}`;

    const createStaff = await request(url, 'POST', '/api/v1/admin/staff', {
      token: state.admin.accessToken,
      body: {
        name: 'Phase1 Service Staff',
        email: staffEmail,
        mobile: staffMobile,
        password: 'Phase1@123',
        role: 'service-staff',
      },
    });
    assert(createStaff.status === 201, `create staff returned ${createStaff.status}`);
    state.createdAdminStaffId = getId(createStaff.json?.data?.staff);
    assert(state.createdAdminStaffId, 'Created admin staff id missing');

    const listStaff = await request(url, 'GET', '/api/v1/admin/staff?q=Phase1%20Service', {
      token: state.admin.accessToken,
    });
    assert(listStaff.status === 200, `list staff returned ${listStaff.status}`);
    assert(
      (listStaff.json?.data?.staff ?? []).some((member) => getId(member) === state.createdAdminStaffId),
      'Created admin staff member was not returned in list staff',
    );

    const getStaff = await request(url, 'GET', `/api/v1/admin/staff/${state.createdAdminStaffId}`, {
      token: state.admin.accessToken,
    });
    assert(getStaff.status === 200, `get staff returned ${getStaff.status}`);
    assert(getStaff.json?.data?.staff?.activeShift == null, 'Newly created staff should not have an active shift');

    const assignShift = await request(url, 'POST', '/api/v1/admin/staff/shifts', {
      token: state.admin.accessToken,
      body: {
        staffId: state.createdAdminStaffId,
        name: 'Morning Service',
        startTime: '09:00',
        endTime: '17:00',
        days: ['Mon', 'Tue', 'Wed'],
      },
    });
    assert(assignShift.status === 201, `assign staff shift returned ${assignShift.status}`);
    state.createdStaffShiftId = getId(assignShift.json?.data?.shift);
    assert(state.createdStaffShiftId, 'Created staff shift id missing');

    const getStaffWithShift = await request(url, 'GET', `/api/v1/admin/staff/${state.createdAdminStaffId}`, {
      token: state.admin.accessToken,
    });
    assert(getStaffWithShift.status === 200, `get staff with shift returned ${getStaffWithShift.status}`);
    assert(
      getId(getStaffWithShift.json?.data?.staff?.activeShift) === state.createdStaffShiftId,
      'Assigned staff shift was not returned as the active shift',
    );

    const updateStaff = await request(url, 'PATCH', `/api/v1/admin/staff/${state.createdAdminStaffId}`, {
      token: state.admin.accessToken,
      body: {
        name: 'Phase1 Service Staff Updated',
        status: 'INACTIVE',
      },
    });
    assert(updateStaff.status === 200, `update staff returned ${updateStaff.status}`);
    assert(updateStaff.json?.data?.staff?.status === 'INACTIVE', 'Updated staff status did not persist');

    const deleteStaff = await request(url, 'DELETE', `/api/v1/admin/staff/${state.createdAdminStaffId}`, {
      token: state.admin.accessToken,
    });
    assert(deleteStaff.status === 200, `delete staff returned ${deleteStaff.status}`);

    const deletedStaff = await request(url, 'GET', `/api/v1/admin/staff/${state.createdAdminStaffId}`, {
      token: state.admin.accessToken,
    });
    assert(deletedStaff.status === 404, `deleted staff should return 404, got ${deletedStaff.status}`);

    const createOffer = await request(url, 'POST', '/api/v1/admin/offers', {
      token: state.admin.accessToken,
      body: {
        name: 'Phase1 Offer',
        code: offerCode,
        discountPercent: 15,
      },
    });
    assert(createOffer.status === 201, `create offer returned ${createOffer.status}`);
    state.createdOfferId = getId(createOffer.json?.data?.offer);
    assert(state.createdOfferId, 'Created offer id missing');

    const listOffers = await request(url, 'GET', `/api/v1/admin/offers?q=${offerCode}`, {
      token: state.admin.accessToken,
    });
    assert(listOffers.status === 200, `list offers returned ${listOffers.status}`);
    assert(
      (listOffers.json?.data?.offers ?? []).some((offer) => getId(offer) === state.createdOfferId),
      'Created offer was not returned in offer listing',
    );

    const getOffer = await request(url, 'GET', `/api/v1/admin/offers/${state.createdOfferId}`, {
      token: state.admin.accessToken,
    });
    assert(getOffer.status === 200, `get offer returned ${getOffer.status}`);

    const updateOffer = await request(url, 'PATCH', `/api/v1/admin/offers/${state.createdOfferId}`, {
      token: state.admin.accessToken,
      body: {
        discountPercent: 20,
        active: false,
      },
    });
    assert(updateOffer.status === 200, `update offer returned ${updateOffer.status}`);
    assert(updateOffer.json?.data?.offer?.discountPercent === 20, 'Updated offer discount was not persisted');

    const deleteOffer = await request(url, 'DELETE', `/api/v1/admin/offers/${state.createdOfferId}`, {
      token: state.admin.accessToken,
    });
    assert(deleteOffer.status === 200, `delete offer returned ${deleteOffer.status}`);

    const deletedOffer = await request(url, 'GET', `/api/v1/admin/offers/${state.createdOfferId}`, {
      token: state.admin.accessToken,
    });
    assert(deletedOffer.status === 404, `deleted offer should return 404, got ${deletedOffer.status}`);

    const createInventoryItem = await request(url, 'POST', '/api/v1/admin/inventory', {
      token: state.admin.accessToken,
      body: {
        name: inventoryName,
        stock: 3,
        unit: 'kg',
        threshold: 5,
      },
    });
    assert(createInventoryItem.status === 201, `create inventory item returned ${createInventoryItem.status}`);
    state.createdInventoryItemId = getId(createInventoryItem.json?.data?.item);
    assert(state.createdInventoryItemId, 'Created inventory item id missing');

    const listInventory = await request(url, 'GET', `/api/v1/admin/inventory?q=${encodeURIComponent(inventoryName)}`, {
      token: state.admin.accessToken,
    });
    assert(listInventory.status === 200, `list inventory returned ${listInventory.status}`);
    assert(
      (listInventory.json?.data?.items ?? []).some((item) => getId(item) === state.createdInventoryItemId),
      'Created inventory item was not returned in inventory listing',
    );

    const updateInventory = await request(url, 'PATCH', `/api/v1/admin/inventory/${state.createdInventoryItemId}`, {
      token: state.admin.accessToken,
      body: {
        stock: 2,
        threshold: 4,
      },
    });
    assert(updateInventory.status === 200, `update inventory item returned ${updateInventory.status}`);
    assert(updateInventory.json?.data?.item?.stock === 2, 'Updated inventory stock was not persisted');

    const inventoryAlerts = await request(url, 'GET', '/api/v1/admin/inventory/alerts', {
      token: state.admin.accessToken,
    });
    assert(inventoryAlerts.status === 200, `inventory alerts returned ${inventoryAlerts.status}`);
    assert(
      (inventoryAlerts.json?.data?.alerts ?? []).some((item) => getId(item) === state.createdInventoryItemId),
      'Low-stock inventory item was not returned by alerts',
    );

    return 'Verified Rahul admin staff/offers/inventory routes including shift assignment and stock alerts';
  });

  await runStep('table edge cases and restaurant scoping', async () => {
    const missingTableId = new mongoose.Types.ObjectId().toString();
    const spoofedRestaurantId = new mongoose.Types.ObjectId().toString();
    const spoofedTableNumber = (Date.now() % 1000) + 400;
    const foreignTableId = new mongoose.Types.ObjectId();
    const foreignTableIdString = foreignTableId.toString();
    const foreignRestaurantId = new mongoose.Types.ObjectId();
    const now = new Date();

    const missingAdminTable = await request(url, 'GET', `/api/v1/admin/tables/${missingTableId}`, {
      token: state.admin.accessToken,
    });
    assert(missingAdminTable.status === 404, `missing admin table should return 404, got ${missingAdminTable.status}`);

    const missingAdminUpdate = await request(url, 'PATCH', `/api/v1/admin/tables/${missingTableId}`, {
      token: state.admin.accessToken,
      body: { section: 'Missing Table' },
    });
    assert(
      missingAdminUpdate.status === 404,
      `updating a missing admin table should return 404, got ${missingAdminUpdate.status}`,
    );

    const missingAdminDelete = await request(url, 'DELETE', `/api/v1/admin/tables/${missingTableId}`, {
      token: state.admin.accessToken,
    });
    assert(
      missingAdminDelete.status === 404,
      `deleting a missing admin table should return 404, got ${missingAdminDelete.status}`,
    );

    const spoofedCreate = await request(url, 'POST', '/api/v1/admin/tables', {
      token: state.admin.accessToken,
      body: {
        restaurantId: spoofedRestaurantId,
        name: `VERIFY-SCOPE-${spoofedTableNumber}`,
        number: spoofedTableNumber,
        floor: 4,
        section: 'Scope Guard',
        capacity: 2,
      },
    });
    assert(spoofedCreate.status === 403, `scoped create table should be rejected with 403 for spoofed tenant, got ${spoofedCreate.status}`);

    const spoofedBulkCreate = await request(url, 'POST', '/api/v1/admin/tables/bulk', {
      token: state.admin.accessToken,
      body: {
        tables: [
          {
            restaurantId: spoofedRestaurantId,
            name: `VERIFY-SCOPE-BULK-${spoofedTableNumber + 1}`,
            number: spoofedTableNumber + 1,
            floor: 4,
            section: 'Scope Guard',
            capacity: 2,
          },
        ],
      },
    });
    assert(spoofedBulkCreate.status === 403, `scoped bulk create should be rejected with 403 for spoofed tenant, got ${spoofedBulkCreate.status}`);

    await tablesCollection.insertOne({
      _id: foreignTableId,
      restaurantId: foreignRestaurantId,
      tableNumber: `VERIFY-FOREIGN-${spoofedTableNumber + 2}`,
      capacity: 4,
      floor: 9,
      section: 'Foreign Scope',
      status: 'AVAILABLE',
      qrCode: `foreign-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      isActive: true,
      currentSessionId: null,
      createdAt: now,
      updatedAt: now,
    });

    const adminTables = await request(url, 'GET', '/api/v1/admin/tables', {
      token: state.admin.accessToken,
    });
    assert(adminTables.status === 200, `admin tables list returned ${adminTables.status}`);
    assert(
      !(adminTables.json?.data?.tables ?? []).some((table) => getId(table) === foreignTableIdString),
      'Admin table list leaked a table from another restaurant',
    );

    const foreignAdminTable = await request(url, 'GET', `/api/v1/admin/tables/${foreignTableIdString}`, {
      token: state.admin.accessToken,
    });
    assert(
      foreignAdminTable.status === 404,
      `admin foreign table lookup should return 404, got ${foreignAdminTable.status}`,
    );

    const foreignStaffTable = await request(url, 'GET', `/api/v1/staff/tables/${foreignTableIdString}`, {
      token: state.staff.accessToken,
    });
    assert(
      foreignStaffTable.status === 404,
      `staff foreign table lookup should return 404, got ${foreignStaffTable.status}`,
    );

    const foreignStaffAssign = await request(url, 'PATCH', `/api/v1/staff/tables/${foreignTableIdString}/assign`, {
      token: state.staff.accessToken,
      body: { staffId: state.staff.user.id ?? state.staff.user._id },
    });
    assert(
      foreignStaffAssign.status === 404,
      `staff foreign table assign should return 404, got ${foreignStaffAssign.status}`,
    );

    return 'Verified admin/staff table 404 behavior and restaurant scoping for create, bulk create, list, and detail actions';
  });

  await runStep('menu contract and filter flow', async () => {
    const restaurantObjectId = toObjectId(state.restaurantId);
    const [pizzaCategory, popularItem, recommendedItem] = await Promise.all([
      menuCategoriesCollection.findOne({ restaurantId: restaurantObjectId, name: 'pizza' }),
      menuItemsCollection.findOne({ restaurantId: restaurantObjectId, name: 'Tandoori Broccoli' }),
      menuItemsCollection.findOne({ restaurantId: restaurantObjectId, name: 'Truffle Mushroom Pizza' }),
    ]);

    assert(pizzaCategory, 'Seed pizza category missing for menu verification');
    assert(popularItem, 'Seed popular menu item missing for menu verification');
    assert(recommendedItem, 'Seed recommended menu item missing for menu verification');

    const adminCategories = await request(url, 'GET', '/api/v1/admin/menu/categories', {
      token: state.admin.accessToken,
    });
    assert(adminCategories.status === 200, `admin menu categories returned ${adminCategories.status}`);
    const adminCategoryRows = adminCategories.json?.data ?? [];
    assert(adminCategoryRows.length >= 3, 'Admin menu categories did not include the seeded categories');

    const adminItems = await request(url, 'GET', '/api/v1/admin/menu/items?page=1&limit=10', {
      token: state.admin.accessToken,
    });
    assert(adminItems.status === 200, `admin menu items returned ${adminItems.status}`);
    const adminItemRows = adminItems.json?.data?.items ?? [];
    assert(adminItemRows.some((item) => item?.name === popularItem.name), 'Admin menu items missed the seeded popular item');

    const publicCategories = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}/categories`);
    assert(publicCategories.status === 200, `public menu categories returned ${publicCategories.status}`);
    const publicCategoryRows = publicCategories.json?.data ?? [];
    assert(publicCategoryRows.every((category) => category?.isHidden === false), 'Public menu categories exposed hidden categories');

    const publicMenuRoot = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}`);
    assert(publicMenuRoot.status === 200, `public menu root returned ${publicMenuRoot.status}`);
    const publicRootItems = publicMenuRoot.json?.data?.items ?? [];
    assert(publicRootItems.length >= 3, 'Public menu root did not return the seeded menu items');

    const publicVeg = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?veg=true`);
    assert(publicVeg.status === 200, `public veg filter returned ${publicVeg.status}`);
    assert((publicVeg.json?.data?.items ?? []).every((item) => item?.isVeg === true), 'Public veg filter returned non-veg items');

    const publicCategory = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?category=pizza`);
    assert(publicCategory.status === 200, `public category filter returned ${publicCategory.status}`);
    const publicCategoryItems = publicCategory.json?.data?.items ?? [];
    assert(publicCategoryItems.length > 0, 'Public category filter returned no pizza items');
    assert(
      publicCategoryItems.every((item) => String(item?.categoryId) === String(pizzaCategory._id)),
      'Public category filter returned items outside the pizza category',
    );

    const publicSpicyFalse = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?spicy=false`);
    assert(publicSpicyFalse.status === 200, `public spicy=false filter returned ${publicSpicyFalse.status}`);
    const publicSpicyRows = publicSpicyFalse.json?.data?.items ?? [];
    assert(publicSpicyRows.length > 0, 'Public spicy=false filter returned no items');
    assert(
      publicSpicyRows.every((item) => Number(item?.spiceLevel ?? 0) === 0),
      'Public spicy=false filter returned spicy items',
    );

    const publicAvailable = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?available=true`);
    assert(publicAvailable.status === 200, `public availability filter returned ${publicAvailable.status}`);
    const publicAvailableItems = publicAvailable.json?.data?.items ?? [];
    assert(publicAvailableItems.every((item) => item?.isAvailable === true), 'Public availability filter returned unavailable items');
    assert(
      !publicAvailableItems.some((item) => item?.name === 'Saffron Tres Leches'),
      'Public availability filter leaked the seeded unavailable item',
    );

    const publicPopular = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?popular=true`);
    assert(publicPopular.status === 200, `public popular filter returned ${publicPopular.status}`);
    const publicPopularItems = publicPopular.json?.data?.items ?? [];
    assert(publicPopularItems.some((item) => item?.name === popularItem.name), 'Public popular filter missed the seeded popular item');
    assert(
      publicPopularItems.every((item) => Array.isArray(item?.tags) && item.tags.includes('popular')),
      'Public popular filter returned non-popular items',
    );

    const publicRecommended = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?recommended=true`);
    assert(publicRecommended.status === 200, `public recommended filter returned ${publicRecommended.status}`);
    const publicRecommendedItems = publicRecommended.json?.data?.items ?? [];
    assert(
      publicRecommendedItems.some((item) => item?.name === recommendedItem.name),
      'Public recommended filter missed the seeded recommended item',
    );
    assert(
      publicRecommendedItems.every((item) => Array.isArray(item?.tags) && item.tags.includes('recommended')),
      'Public recommended filter returned non-recommended items',
    );

    const publicSearch = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?search=pizza`);
    assert(publicSearch.status === 200, `public search filter returned ${publicSearch.status}`);
    const publicSearchItems = publicSearch.json?.data?.items ?? [];
    assert(publicSearchItems.length > 0, 'Public search filter returned no pizza matches');
    assert(
      publicSearchItems.every((item) =>
        `${item?.name ?? ''} ${item?.description ?? ''} ${Array.isArray(item?.tags) ? item.tags.join(' ') : ''}`
          .toLowerCase()
          .includes('pizza'),
      ),
      'Public search filter returned items unrelated to the search term',
    );

    const publicPrice = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?priceMin=300&priceMax=650`);
    assert(publicPrice.status === 200, `public price filter returned ${publicPrice.status}`);
    const publicPriceItems = publicPrice.json?.data?.items ?? [];
    assert(publicPriceItems.length > 0, 'Public price filter returned no items');
    assert(
      publicPriceItems.every((item) => Number(item?.price) >= 300 && Number(item?.price) <= 650),
      'Public price filter returned items outside the requested price range',
    );

    const publicSortPrice = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?sortBy=price`);
    assert(publicSortPrice.status === 200, `public price sort returned ${publicSortPrice.status}`);
    assertAscending(
      (publicSortPrice.json?.data?.items ?? []).map((item) => Number(item?.price ?? 0)),
      'Public price sort did not return ascending prices',
    );

    const publicSortName = await request(url, 'GET', `/api/v1/public/menu/${state.restaurantId}?sortBy=name_asc`);
    assert(publicSortName.status === 200, `public name sort returned ${publicSortName.status}`);
    assertAscending(
      (publicSortName.json?.data?.items ?? []).map((item) => String(item?.name ?? '').toLowerCase()),
      'Public name sort did not return ascending item names',
    );

    const publicItemDetail = await request(
      url,
      'GET',
      `/api/v1/public/menu/${state.restaurantId}/items/${recommendedItem._id.toString()}`,
    );
    assert(publicItemDetail.status === 200, `public menu item detail returned ${publicItemDetail.status}`);

    const customerCategories = await request(url, 'GET', '/api/v1/customer/menu/categories', {
      sessionToken: state.createdSessionToken,
    });
    assert(customerCategories.status === 200, `customer menu categories returned ${customerCategories.status}`);

    const customerSearch = await request(url, 'GET', '/api/v1/customer/menu/items?search=pizza&sortBy=price_desc', {
      sessionToken: state.createdSessionToken,
    });
    assert(customerSearch.status === 200, `customer menu search returned ${customerSearch.status}`);
    const customerSearchItems = customerSearch.json?.data?.items ?? [];
    assert(customerSearchItems.length > 0, 'Customer menu search returned no pizza items');
    assertAscending(
      customerSearchItems.map((item) => -Number(item?.price ?? 0)),
      'Customer menu price_desc sort did not return descending prices',
    );

    const customerItemDetail = await request(
      url,
      'GET',
      `/api/v1/customer/menu/items/${recommendedItem._id.toString()}`,
      { sessionToken: state.createdSessionToken },
    );
    assert(customerItemDetail.status === 200, `customer menu item detail returned ${customerItemDetail.status}`);

    return 'Verified admin/public/customer menu paths plus category, veg, spicy, availability, popular, recommended, search, price, and sort filters';
  });

  await runStep('session lifecycle contract and expiry flow', async () => {
    const session = await request(url, 'GET', '/api/v1/customer/session', {
      sessionToken: state.createdSessionToken,
    });
    assert(session.status === 200, `customer session returned ${session.status}`);
    assert(getId(session.json?.data?.session) === state.createdSessionId, 'customer session did not return the active session');

    const recover = await request(url, 'GET', '/api/v1/public/table-session/recover', {
      sessionToken: state.createdSessionToken,
    });
    assert(recover.status === 200, `recover session returned ${recover.status}`);
    assert(
      String(recover.json?.data?.session?.sessionId ?? '') === state.createdSessionId,
      'recover session returned the wrong session id',
    );

    const beforeExtend = await getSessionDocumentByToken(state.createdSessionToken);
    assert(beforeExtend, 'Primary session missing in database before extend');

    const extend = await request(url, 'PATCH', '/api/v1/customer/session/extend', {
      sessionToken: state.createdSessionToken,
    });
    assert(extend.status === 200, `customer session extend returned ${extend.status}`);

    const extendedExpiry = new Date(extend.json?.data?.session?.expiresAt ?? 0).getTime();
    assert(extendedExpiry > new Date(beforeExtend.expiresAt).getTime(), 'extend did not move session expiry forward');

    const tableThreeDoc = await tablesCollection.findOne({ tableNumber: 'T3' });
    const tableThreeToken = tableThreeDoc?.qrToken || 'amber-table-t3-seed';

    const blockedNeedsCleaning = await request(url, 'POST', '/api/v1/public/table-session/create', {
      body: {
        token: tableThreeToken,
        customerName: 'Blocked Guest',
        mobile: '9876543211',
        partySize: 2,
      },
    });
    assert(blockedNeedsCleaning.status === 400, `needs-cleaning table should reject session create, got ${blockedNeedsCleaning.status}`);

    const idleSessionCreate = await request(url, 'POST', '/api/v1/public/table-session/create', {
      body: {
        token: state.idleExpiryQrToken,
        customerName: 'Idle Timeout Guest',
        mobile: '9876543212',
        partySize: 2,
      },
    });
    assert(idleSessionCreate.status === 201, `idle timeout session create returned ${idleSessionCreate.status}`);
    state.idleExpirySessionToken =
      idleSessionCreate.json?.data?.session?.token ?? idleSessionCreate.json?.data?.sessionToken ?? '';
    assert(state.idleExpirySessionToken, 'Idle timeout session token missing');

    const idleSessionDocument = await getSessionDocumentByToken(state.idleExpirySessionToken);
    assert(idleSessionDocument, 'Idle timeout session missing in database');

    await tableSessionsCollection.updateOne(
      { _id: idleSessionDocument._id },
      {
        $set: {
          lastActivityAt: new Date(Date.now() - 25 * 60 * 1000),
        },
      },
    );

    const idleRecover = await request(url, 'GET', '/api/v1/public/table-session/recover', {
      sessionToken: state.idleExpirySessionToken,
    });
    assert(idleRecover.status === 401, `idle timeout should return 401, got ${idleRecover.status}`);

    const expiredIdleSession = await getSessionDocumentByToken(state.idleExpirySessionToken);
    assert(expiredIdleSession?.status === 'EXPIRED', 'Idle timeout session was not marked EXPIRED');

    const idleTable = await getTableDocument(state.idleExpiryTableId);
    assert(idleTable?.status === 'NEEDS_CLEANING', 'Idle timeout table did not move to NEEDS_CLEANING');
    assert(idleTable?.currentSessionId == null, 'Idle timeout table still points to a session');

    const idleCleaningTask = await getLatestCleaningTask(state.idleExpiryTableId);
    assert(idleCleaningTask?.status === 'PENDING', 'Idle timeout did not create a pending cleaning task');

    const blockedIdleRestart = await request(url, 'POST', '/api/v1/public/table-session/create', {
      body: {
        token: state.idleExpiryQrToken,
        customerName: 'Retry Idle Guest',
        mobile: '9876543213',
        partySize: 2,
      },
    });
    assert(blockedIdleRestart.status === 400, `idle-expired table should stay blocked until cleaning, got ${blockedIdleRestart.status}`);

    const hardExpirySessionCreate = await request(url, 'POST', '/api/v1/public/table-session/create', {
      body: {
        token: state.hardExpiryQrToken,
        customerName: 'Hard Expiry Guest',
        mobile: '9876543214',
        partySize: 2,
      },
    });
    assert(hardExpirySessionCreate.status === 201, `hard expiry session create returned ${hardExpirySessionCreate.status}`);
    state.hardExpirySessionToken =
      hardExpirySessionCreate.json?.data?.session?.token ?? hardExpirySessionCreate.json?.data?.sessionToken ?? '';
    assert(state.hardExpirySessionToken, 'Hard expiry session token missing');

    const hardSessionDocument = await getSessionDocumentByToken(state.hardExpirySessionToken);
    assert(hardSessionDocument, 'Hard expiry session missing in database');

    await tableSessionsCollection.updateOne(
      { _id: hardSessionDocument._id },
      {
        $set: {
          expiresAt: new Date(Date.now() - 60 * 1000),
        },
      },
    );

    const hardValidate = await request(url, 'POST', '/api/v1/public/table-session/validate', {
      body: { token: state.hardExpirySessionToken },
    });
    assert(hardValidate.status === 401, `hard expiry should return 401, got ${hardValidate.status}`);

    const expiredHardSession = await getSessionDocumentByToken(state.hardExpirySessionToken);
    assert(expiredHardSession?.status === 'EXPIRED', 'Hard expiry session was not marked EXPIRED');

    const hardTable = await getTableDocument(state.hardExpiryTableId);
    assert(hardTable?.status === 'NEEDS_CLEANING', 'Hard expiry table did not move to NEEDS_CLEANING');
    assert(hardTable?.currentSessionId == null, 'Hard expiry table still points to a session');

    const hardCleaningTask = await getLatestCleaningTask(state.hardExpiryTableId);
    assert(hardCleaningTask?.status === 'PENDING', 'Hard expiry did not create a pending cleaning task');

    return 'Verified PRD session contract, recover/current/extend flow, and DB-backed idle/hard expiry cleanup';
  });

  await runStep('cart edge cases and snapshot flow', async () => {
    const restaurantObjectId = toObjectId(state.restaurantId);
    const [starterCategory, snapshotItem, unavailableItem] = await Promise.all([
      menuCategoriesCollection.findOne({ restaurantId: restaurantObjectId, name: 'starter' }),
      menuItemsCollection.findOne({ restaurantId: restaurantObjectId, name: 'Tandoori Broccoli' }),
      menuItemsCollection.findOne({ restaurantId: restaurantObjectId, name: 'Saffron Tres Leches' }),
    ]);

    assert(starterCategory, 'Seed starter category missing for cart verification');
    assert(snapshotItem, 'Seed snapshot menu item missing for cart verification');
    assert(unavailableItem, 'Seed unavailable menu item missing for cart verification');

    const hiddenItemId = new mongoose.Types.ObjectId();
    const hiddenItemName = `Hidden Verify ${Date.now()}`;
    const snapshotItemId = snapshotItem._id.toString();
    const unavailableItemId = unavailableItem._id.toString();
    const originalSnapshotPrice = Number(snapshotItem.price);
    const updatedSnapshotPrice = originalSnapshotPrice + 80;
    const adminActorId = toObjectId(state.admin.user.id ?? state.admin.user._id);

    await menuItemsCollection.insertOne({
      _id: hiddenItemId,
      restaurantId: restaurantObjectId,
      categoryId: starterCategory._id,
      name: hiddenItemName,
      description: 'Hidden verification item',
      shortDescription: 'Hidden verification item',
      price: 450,
      isVeg: true,
      isAvailable: true,
      isHidden: true,
      spiceLevel: 0,
      preparationTime: 5,
      tags: ['hidden'],
      displayOrder: 99,
      createdBy: adminActorId,
      updatedBy: adminActorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      const initialCart = await request(url, 'GET', '/api/v1/customer/cart', {
        sessionToken: state.createdSessionToken,
      });
      assert(initialCart.status === 200, `initial cart fetch returned ${initialCart.status}`);
      assert((initialCart.json?.data?.items ?? []).length === 0, 'Fresh verification cart should start empty');

      const invalidAdd = await request(url, 'POST', '/api/v1/customer/cart/items', {
        sessionToken: state.createdSessionToken,
        body: {
          menuItem: new mongoose.Types.ObjectId().toString(),
          quantity: 1,
        },
      });
      assert(invalidAdd.status === 404, `invalid cart item add should return 404, got ${invalidAdd.status}`);

      const unavailableAdd = await request(url, 'POST', '/api/v1/customer/cart/items', {
        sessionToken: state.createdSessionToken,
        body: {
          menuItem: unavailableItemId,
          quantity: 1,
        },
      });
      assert(
        unavailableAdd.status === 400,
        `unavailable cart item add should return 400, got ${unavailableAdd.status}`,
      );

      const hiddenAdd = await request(url, 'POST', '/api/v1/customer/cart/items', {
        sessionToken: state.createdSessionToken,
        body: {
          menuItem: hiddenItemId.toString(),
          quantity: 1,
        },
      });
      assert(hiddenAdd.status === 400, `hidden cart item add should return 400, got ${hiddenAdd.status}`);

      const hiddenAdminDetail = await request(url, 'GET', `/api/v1/admin/menu/items/${hiddenItemId.toString()}`, {
        token: state.admin.accessToken,
      });
      assert(hiddenAdminDetail.status === 200, `admin hidden menu item detail should remain accessible, got ${hiddenAdminDetail.status}`);

      const hiddenCustomerDetail = await request(
        url,
        'GET',
        `/api/v1/customer/menu/items/${hiddenItemId.toString()}`,
        { sessionToken: state.createdSessionToken },
      );
      assert(
        hiddenCustomerDetail.status === 404,
        `customer hidden menu item detail should return 404, got ${hiddenCustomerDetail.status}`,
      );

      const hiddenPublicDetail = await request(
        url,
        'GET',
        `/api/v1/public/menu/${state.restaurantId}/items/${hiddenItemId.toString()}`,
      );
      assert(
        hiddenPublicDetail.status === 404,
        `public hidden menu item detail should return 404, got ${hiddenPublicDetail.status}`,
      );

      const hiddenPublicQueryDetail = await request(
        url,
        'GET',
        `/api/v1/public/menu/items/${hiddenItemId.toString()}?restaurantId=${state.restaurantId}`,
      );
      assert(
        hiddenPublicQueryDetail.status === 404,
        `public hidden menu query detail should return 404, got ${hiddenPublicQueryDetail.status}`,
      );

      const snapshotAdd = await request(url, 'POST', '/api/v1/customer/cart/items', {
        sessionToken: state.createdSessionToken,
        body: {
          menuItem: snapshotItemId,
          quantity: 1,
          notes: 'snapshot verify',
        },
      });
      assert(snapshotAdd.status === 201, `snapshot cart add returned ${snapshotAdd.status}`);
      const snapshotCart = snapshotAdd.json?.data;
      const snapshotLines = (snapshotCart?.items ?? []).filter(
        (item) => String(item?.menuItem?._id) === snapshotItemId && item?.notes === 'snapshot verify',
      );
      assert(snapshotLines.length === 1, 'Snapshot cart add should create exactly one matching line');
      assert(
        Number(snapshotLines[0]?.unitPrice) === originalSnapshotPrice,
        'Snapshot cart add did not use the original menu price',
      );
      assert(Number(snapshotCart?.tax ?? -1) === 0, 'Cart tax should remain zero until billing ownership lands');
      assert(
        Number(snapshotCart?.discount ?? -1) === 0,
        'Cart discount should remain zero until billing ownership lands',
      );
      assert(
        Number(snapshotCart?.grandTotal ?? -1) === Number(snapshotCart?.subtotal ?? 0),
        'Cart grandTotal should equal subtotal while tax and discount are zero',
      );

      await menuItemsCollection.updateOne(
        { _id: snapshotItem._id },
        {
          $set: {
            price: updatedSnapshotPrice,
            updatedAt: new Date(),
          },
        },
      );

      const snapshotReAdd = await request(url, 'POST', '/api/v1/customer/cart/items', {
        sessionToken: state.createdSessionToken,
        body: {
          menuItem: snapshotItemId,
          quantity: 1,
          notes: 'snapshot verify',
        },
      });
      assert(snapshotReAdd.status === 201, `snapshot re-add returned ${snapshotReAdd.status}`);
      const repricedLines = (snapshotReAdd.json?.data?.items ?? []).filter(
        (item) => String(item?.menuItem?._id) === snapshotItemId && item?.notes === 'snapshot verify',
      );
      assert(
        repricedLines.length === 2,
        'Cart should preserve the original snapshot and create a new line when the menu price changes',
      );
      const linePrices = repricedLines
        .map((item) => Number(item?.unitPrice ?? 0))
        .sort((left, right) => left - right);
      assert(
        linePrices[0] === originalSnapshotPrice && linePrices[1] === updatedSnapshotPrice,
        'Cart snapshot lines did not preserve both the original and updated prices',
      );

      const clearedCart = await request(url, 'DELETE', '/api/v1/customer/cart', {
        sessionToken: state.createdSessionToken,
      });
      assert(clearedCart.status === 200, `clear cart edge-case cleanup returned ${clearedCart.status}`);
      assert((clearedCart.json?.data?.items ?? []).length === 0, 'Clear cart should remove all cart items');
      assert(Number(clearedCart.json?.data?.subtotal ?? -1) === 0, 'Cleared cart subtotal should be zero');
      assert(Number(clearedCart.json?.data?.grandTotal ?? -1) === 0, 'Cleared cart grandTotal should be zero');

      const emptyCartOrder = await request(url, 'POST', '/api/v1/customer/orders', {
        sessionToken: state.createdSessionToken,
        body: { specialInstructions: 'empty cart should fail' },
      });
      assert(emptyCartOrder.status === 400, `empty cart order should return 400, got ${emptyCartOrder.status}`);

      return 'Verified invalid, hidden, unavailable, and empty-cart cases plus hidden-detail blocking, stable cart price snapshots, and zero-tax totals';
    } finally {
      await menuItemsCollection.updateOne(
        { _id: snapshotItem._id },
        {
          $set: {
            price: originalSnapshotPrice,
            updatedAt: new Date(),
          },
        },
      );
      await menuItemsCollection.deleteOne({ _id: hiddenItemId });
      await request(url, 'DELETE', '/api/v1/customer/cart', {
        sessionToken: state.createdSessionToken,
      }).catch(() => null);
    }
  });

  await runStep('customer menu cart order payment flow', async () => {
    const sessionToken = state.createdSessionToken;

    const session = await request(url, 'GET', '/api/v1/customer/session', { sessionToken });
    assert(session.status === 200, `customer session returned ${session.status}`);

    const extend = await request(url, 'PATCH', '/api/v1/customer/session/extend', { sessionToken });
    assert(extend.status === 200, `customer session extend returned ${extend.status}`);

    const categories = await request(url, 'GET', '/api/v1/customer/menu/categories', { sessionToken });
    assert(categories.status === 200, `customer categories returned ${categories.status}`);

    const items = await request(url, 'GET', '/api/v1/customer/menu/items?veg=true&sortBy=price', { sessionToken });
    assert(items.status === 200, `customer menu items returned ${items.status}`);
    const menuItems = items.json?.data?.items ?? [];
    const menuItem = menuItems.find((item) => item?.isAvailable !== false) ?? menuItems[0];
    const menuItemId = getId(menuItem);
    assert(menuItemId, 'No menu item available for customer flow');

    const itemDetails = await request(url, 'GET', `/api/v1/customer/menu/items/${menuItemId}`, { sessionToken });
    assert(itemDetails.status === 200, `customer menu item details returned ${itemDetails.status}`);

    const updateItemImage = await request(url, 'POST', `/api/v1/admin/menu/items/${menuItemId}/image`, {
      token: state.admin.accessToken,
      body: { image: 'https://example.com/phase1-verify-menu-item.png' },
    });
    assert(updateItemImage.status === 200, `menu item image update returned ${updateItemImage.status}`);
    assert(
      updateItemImage.json?.data?.image === 'https://example.com/phase1-verify-menu-item.png',
      'menu item image update did not persist the primary image',
    );

    const cart = await request(url, 'GET', '/api/v1/customer/cart', { sessionToken });
    assert(cart.status === 200, `customer cart returned ${cart.status}`);

    const addCartItem = await request(url, 'POST', '/api/v1/customer/cart/items', {
      sessionToken,
      body: { menuItem: menuItemId, quantity: 2, notes: 'verify spicy' },
    });
    assert(addCartItem.status === 201, `add cart item returned ${addCartItem.status}`);
    state.createdCartItemId = getId(last(addCartItem.json?.data?.items));
    assert(state.createdCartItemId, 'Created cart item id missing');

    const updateCartItem = await request(url, 'PATCH', `/api/v1/customer/cart/items/${state.createdCartItemId}`, {
      sessionToken,
      body: { quantity: 3, notes: 'verify updated' },
    });
    assert(updateCartItem.status === 200, `update cart item returned ${updateCartItem.status}`);

    const addRemovableCartItem = await request(url, 'POST', '/api/v1/customer/cart/items', {
      sessionToken,
      body: { menuItem: menuItemId, quantity: 1, notes: 'remove me' },
    });
    assert(addRemovableCartItem.status === 201, `add removable cart item returned ${addRemovableCartItem.status}`);
    const removableCartItemId = getId(last(addRemovableCartItem.json?.data?.items));
    assert(removableCartItemId, 'Removable cart item id missing');

    const removeCartItem = await request(url, 'DELETE', `/api/v1/customer/cart/items/${removableCartItemId}`, {
      sessionToken,
    });
    assert(removeCartItem.status === 200, `remove cart item returned ${removeCartItem.status}`);

    const createOrder = await request(url, 'POST', '/api/v1/customer/orders', {
      sessionToken,
      body: { specialInstructions: 'Less oil please' },
    });
    assert(createOrder.status === 201, `create order returned ${createOrder.status}`);
    state.createdOrderId = getId(createOrder.json?.data?.order);
    assert(state.createdOrderId, 'Created order id missing');

    const listOrders = await request(url, 'GET', '/api/v1/customer/orders?page=1&limit=5', { sessionToken });
    assert(listOrders.status === 200, `list customer orders returned ${listOrders.status}`);

    const orderDetails = await request(url, 'GET', `/api/v1/customer/orders/${state.createdOrderId}`, {
      sessionToken,
    });
    assert(orderDetails.status === 200, `customer order details returned ${orderDetails.status}`);

    const waiterRequest = await request(url, 'POST', '/api/v1/customer/requests/waiter', { sessionToken });
    assert(waiterRequest.status === 201, `customer waiter request returned ${waiterRequest.status}`);
    state.createdRequestId = getId(waiterRequest.json?.data?.request);
    assert(state.createdRequestId, 'Customer waiter request id missing');

    const cleaningRequest = await request(url, 'POST', '/api/v1/customer/requests/cleaning', { sessionToken });
    assert(cleaningRequest.status === 201, `customer cleaning request returned ${cleaningRequest.status}`);
    state.createdCleaningRequestId = getId(cleaningRequest.json?.data?.request);
    assert(state.createdCleaningRequestId, 'Customer cleaning request id missing');

    const bill = await request(url, 'GET', '/api/v1/customer/bill', { sessionToken });
    assert(bill.status === 200, `customer bill returned ${bill.status}`);

    const billRequest = await request(url, 'POST', '/api/v1/customer/bill/request', { sessionToken });
    assert(billRequest.status === 200, `customer bill request returned ${billRequest.status}`);

    const applyCoupon = await request(url, 'POST', '/api/v1/customer/bill/coupon', {
      sessionToken,
      body: { code: 'LUNCH10' },
    });
    assert(applyCoupon.status === 200, `apply coupon returned ${applyCoupon.status}`);

    const removeCoupon = await request(url, 'DELETE', '/api/v1/customer/bill/coupon/LUNCH10', { sessionToken });
    assert(removeCoupon.status === 200, `remove coupon returned ${removeCoupon.status}`);

    const paymentAmount = createOrder.json?.data?.order?.finalAmount ?? 0;
    const createPayment = await request(url, 'POST', '/api/v1/customer/payments/create', {
      sessionToken,
      body: { orderId: state.createdOrderId, amount: paymentAmount, method: 'UPI' },
    });
    assert(createPayment.status === 201, `create payment returned ${createPayment.status}`);
    state.createdPaymentId = getId(createPayment.json?.data?.payment);
    assert(state.createdPaymentId, 'Created payment id missing');

    const verifyPayment = await request(url, 'POST', '/api/v1/customer/payments/verify', {
      sessionToken,
      body: { paymentId: state.createdPaymentId },
    });
    assert(verifyPayment.status === 200, `verify payment returned ${verifyPayment.status}`);

    const paymentStatus = await request(
      url,
      'GET',
      `/api/v1/customer/payments/${state.createdPaymentId}/status`,
      { sessionToken },
    );
    assert(paymentStatus.status === 200, `payment status returned ${paymentStatus.status}`);

    const feedback = await request(url, 'POST', '/api/v1/customer/feedback', {
      sessionToken,
      body: { rating: 5, comment: 'Phase1 verify feedback' },
    });
    assert(feedback.status === 201, `create feedback returned ${feedback.status}`);
    state.createdFeedbackId = getId(feedback.json?.data?.feedback);

    const feedbackList = await request(url, 'GET', '/api/v1/customer/feedback', { sessionToken });
    assert(feedbackList.status === 200, `feedback list returned ${feedbackList.status}`);

    const loyalty = await request(url, 'GET', '/api/v1/customer/loyalty', { sessionToken });
    assert(loyalty.status === 200, `loyalty returned ${loyalty.status}`);

    const offers = await request(url, 'GET', '/api/v1/customer/offers', { sessionToken });
    assert(offers.status === 200, `offers returned ${offers.status}`);

    const eligibility = await request(url, 'GET', '/api/v1/customer/offers/eligibility', { sessionToken });
    assert(eligibility.status === 200, `offer eligibility returned ${eligibility.status}`);

    const reorder = await request(url, 'POST', `/api/v1/customer/orders/${state.createdOrderId}/reorder`, {
      sessionToken,
    });
    assert(reorder.status === 200, `reorder returned ${reorder.status}`);
    state.reorderedOrderId = getId(reorder.json?.data?.order);
    assert(state.reorderedOrderId, 'Reordered order id missing');

    const cancelCandidate = await request(url, 'POST', `/api/v1/customer/orders/${state.createdOrderId}/reorder`, {
      sessionToken,
    });
    assert(cancelCandidate.status === 200, `cancel candidate reorder returned ${cancelCandidate.status}`);
    state.cancelCandidateOrderId = getId(cancelCandidate.json?.data?.order);
    assert(state.cancelCandidateOrderId, 'Cancel candidate order id missing');

    const cancel = await request(url, 'POST', `/api/v1/customer/orders/${state.cancelCandidateOrderId}/cancel`, {
      sessionToken,
    });
    assert(cancel.status === 200, `cancel order returned ${cancel.status}`);
    assert(cancel.json?.data?.order?.status === 'CANCELLED', 'Cancelled order did not return CANCELLED status');
    assert(cancel.json?.data?.order?.cancelledAt, 'Cancelled order did not return cancelledAt');

    const cancelledOrderDocument = await getOrderDocument(state.cancelCandidateOrderId);
    assert(cancelledOrderDocument?.status === 'CANCELLED', 'Cancelled order was not persisted as CANCELLED');
    assert(cancelledOrderDocument?.cancelledAt, 'Cancelled order was not persisted with cancelledAt');

    const cancelAgain = await request(url, 'POST', `/api/v1/customer/orders/${state.cancelCandidateOrderId}/cancel`, {
      sessionToken,
    });
    assert(cancelAgain.status === 400, `cancelling an already-cancelled order should return 400, got ${cancelAgain.status}`);

    const reorderCancelled = await request(url, 'POST', `/api/v1/customer/orders/${state.cancelCandidateOrderId}/reorder`, {
      sessionToken,
    });
    assert(
      reorderCancelled.status === 400,
      `reordering a cancelled order should return 400, got ${reorderCancelled.status}`,
    );

    const clearCart = await request(url, 'DELETE', '/api/v1/customer/cart', { sessionToken });
    assert(clearCart.status === 200, `clear cart returned ${clearCart.status}`);
  });

  await runStep('staff kitchen cleaning super-admin shared flows', async () => {
    const filteredStaffTables = await request(
      url,
      'GET',
      `/api/v1/staff/tables?status=OCCUPIED&floor=2&section=${encodeURIComponent('Verify Updated')}`,
      { token: state.staff.accessToken },
    );
    assert(filteredStaffTables.status === 200, `filtered staff tables returned ${filteredStaffTables.status}`);
    const filteredTables = filteredStaffTables.json?.data?.tables ?? [];
    assert(filteredTables.some((table) => getId(table) === state.createdTableId), 'Filtered staff tables did not include the created occupied table');
    assert(
      filteredTables.every(
        (table) => table?.status === 'OCCUPIED' && Number(table?.floor) === 2 && table?.section === 'Verify Updated',
      ),
      'Filtered staff tables response contained rows outside the requested filters',
    );

    const staffTables = await request(url, 'GET', '/api/v1/staff/tables', { token: state.staff.accessToken });
    assert(staffTables.status === 200, `staff tables returned ${staffTables.status}`);
    const staffTableId = getId(staffTables.json?.data?.tables?.[0]);
    assert(staffTableId, 'No staff table id available');

    const missingStaffTable = await request(
      url,
      'GET',
      `/api/v1/staff/tables/${new mongoose.Types.ObjectId().toString()}`,
      { token: state.staff.accessToken },
    );
    assert(missingStaffTable.status === 404, `missing staff table should return 404, got ${missingStaffTable.status}`);

    const staffTable = await request(url, 'GET', `/api/v1/staff/tables/${staffTableId}`, {
      token: state.staff.accessToken,
    });
    assert(staffTable.status === 200, `staff table details returned ${staffTable.status}`);

    const assignTable = await request(url, 'PATCH', `/api/v1/staff/tables/${staffTableId}/assign`, {
      token: state.staff.accessToken,
      body: { staffId: state.staff.user.id ?? state.staff.user._id },
    });
    assert(assignTable.status === 200, `assign table returned ${assignTable.status}`);

    const reservations = await request(url, 'GET', '/api/v1/staff/reservations', {
      token: state.staff.accessToken,
    });
    assert(reservations.status === 200, `reservations returned ${reservations.status}`);
    state.reservationId = getId(reservations.json?.data?.reservations?.[0]);
    assert(state.reservationId, 'Reservation id missing');

    const reserveTable = await request(url, 'PATCH', `/api/v1/staff/tables/${staffTableId}/reserve`, {
      token: state.staff.accessToken,
      body: { reservationId: state.reservationId },
    });
    assert(reserveTable.status === 200, `reserve table returned ${reserveTable.status}`);

    const occupyTable = await request(url, 'PATCH', `/api/v1/staff/tables/${staffTableId}/occupy`, {
      token: state.staff.accessToken,
    });
    assert(occupyTable.status === 200, `occupy table returned ${occupyTable.status}`);

    const invalidReserveTransition = await request(url, 'PATCH', `/api/v1/staff/tables/${staffTableId}/reserve`, {
      token: state.staff.accessToken,
      body: { reservationId: state.reservationId },
    });
    assert(
      invalidReserveTransition.status === 400,
      `reserve after occupy should be rejected by lifecycle validation, got ${invalidReserveTransition.status}`,
    );

    const queue = await request(url, 'GET', '/api/v1/staff/queue', { token: state.staff.accessToken });
    assert(queue.status === 200, `staff queue returned ${queue.status}`);
    const queueId = state.queueId || getId(queue.json?.data?.entries?.[0]);
    assert(queueId, 'Queue id missing for staff flow');

    const queueDetails = await request(url, 'GET', `/api/v1/staff/queue/${queueId}`, {
      token: state.staff.accessToken,
    });
    assert(queueDetails.status === 200, `queue details returned ${queueDetails.status}`);

    const queuePriority = await request(url, 'PATCH', `/api/v1/staff/queue/${queueId}/priority`, {
      token: state.staff.accessToken,
      body: { priority: 'HIGH' },
    });
    assert(queuePriority.status === 200, `queue priority returned ${queuePriority.status}`);

    const reservationDetail = await request(url, 'GET', `/api/v1/staff/reservations/${state.reservationId}`, {
      token: state.staff.accessToken,
    });
    assert(reservationDetail.status === 200, `reservation detail returned ${reservationDetail.status}`);

    const checkIn = await request(url, 'PATCH', `/api/v1/staff/reservations/${state.reservationId}/check-in`, {
      token: state.staff.accessToken,
      body: { staffId: state.staff.user.id ?? state.staff.user._id },
    });
    assert(checkIn.status === 200, `reservation check-in returned ${checkIn.status}`);

    const readyOrders = await request(url, 'GET', '/api/v1/staff/orders/ready', {
      token: state.staff.accessToken,
    });
    assert(readyOrders.status === 200, `ready orders returned ${readyOrders.status}`);
    state.readyOrderId = getId(readyOrders.json?.data?.orders?.[0]);
    assert(state.readyOrderId, 'Ready order id missing');

    const pickReadyOrder = await request(url, 'PATCH', `/api/v1/staff/orders/${state.readyOrderId}/pick`, {
      token: state.staff.accessToken,
    });
    assert(pickReadyOrder.status === 200, `pick ready order returned ${pickReadyOrder.status}`);
    assert(pickReadyOrder.json?.data?.order?.status === 'PICKED', 'Picked order did not return PICKED status');
    assert(pickReadyOrder.json?.data?.order?.pickedAt, 'Picked order did not return pickedAt');

    const serveReadyOrder = await request(url, 'PATCH', `/api/v1/staff/orders/${state.readyOrderId}/serve`, {
      token: state.staff.accessToken,
    });
    assert(serveReadyOrder.status === 200, `serve ready order returned ${serveReadyOrder.status}`);
    assert(serveReadyOrder.json?.data?.order?.status === 'SERVED', 'Served order did not return SERVED status');
    assert(serveReadyOrder.json?.data?.order?.servedAt, 'Served order did not return servedAt');

    const completeReadyOrder = await request(url, 'PATCH', `/api/v1/staff/orders/${state.readyOrderId}/complete`, {
      token: state.staff.accessToken,
    });
    assert(completeReadyOrder.status === 200, `complete ready order returned ${completeReadyOrder.status}`);
    assert(
      completeReadyOrder.json?.data?.order?.status === 'COMPLETED',
      'Completed order did not return COMPLETED status',
    );
    assert(completeReadyOrder.json?.data?.order?.completedAt, 'Completed order did not return completedAt');
    const completedReadyOrderDocument = await getOrderDocument(state.readyOrderId);
    assert(completedReadyOrderDocument?.status === 'COMPLETED', 'Served order was not persisted as COMPLETED');
    assert(completedReadyOrderDocument?.pickedAt, 'Served order did not persist pickedAt');
    assert(completedReadyOrderDocument?.servedAt, 'Served order did not persist servedAt');
    assert(completedReadyOrderDocument?.completedAt, 'Served order did not persist completedAt');
    assert(
      String(completedReadyOrderDocument?.serviceStaffId ?? '') === String(state.staff.user.id ?? state.staff.user._id),
      'Served order did not persist serviceStaffId',
    );

    const requests = await request(url, 'GET', '/api/v1/staff/requests', { token: state.staff.accessToken });
    assert(requests.status === 200, `staff requests returned ${requests.status}`);
    const requestRows = requests.json?.data?.requests ?? [];
    assert(
      requestRows.some((entry) => getId(entry) === state.createdRequestId),
      'Staff requests list did not include the created waiter request',
    );
    assert(
      requestRows.some((entry) => getId(entry) === state.createdCleaningRequestId),
      'Staff requests list did not include the created cleaning request',
    );

    const acceptRequest = await request(url, 'PATCH', `/api/v1/staff/requests/${state.createdRequestId}/accept`, {
      token: state.staff.accessToken,
      body: { staffId: state.staff.user.id ?? state.staff.user._id },
    });
    assert(acceptRequest.status === 200, `accept request returned ${acceptRequest.status}`);
    assert(acceptRequest.json?.data?.request?.status === 'ACCEPTED', 'Accepted request did not return ACCEPTED status');
    assert(
      String(acceptRequest.json?.data?.acceptedBy) === String(state.staff.user.id ?? state.staff.user._id),
      'Accepted request did not record the accepting staff member',
    );

    const completeRequest = await request(
      url,
      'PATCH',
      `/api/v1/staff/requests/${state.createdRequestId}/complete`,
      { token: state.staff.accessToken },
    );
    assert(completeRequest.status === 200, `complete request returned ${completeRequest.status}`);
    assert(completeRequest.json?.data?.request?.status === 'COMPLETED', 'Completed request did not return COMPLETED status');

    const waiterRequestDocument = await getStaffRequestDocument(state.createdRequestId);
    assert(waiterRequestDocument?.status === 'COMPLETED', 'Waiter request was not persisted as COMPLETED');
    assert(
      String(waiterRequestDocument?.acceptedBy ?? '') === String(state.staff.user.id ?? state.staff.user._id),
      'Waiter request acceptedBy was not persisted correctly',
    );
    assert(
      String(waiterRequestDocument?.completedBy ?? '') === String(state.staff.user.id ?? state.staff.user._id),
      'Waiter request completedBy was not persisted correctly',
    );

    const escalateIssue = await request(url, 'POST', '/api/v1/staff/issues/escalate', {
      token: state.staff.accessToken,
      body: {
        staffId: state.staff.user.id ?? state.staff.user._id,
        entityId: staffTableId,
        entityType: 'table',
        notes: 'Phase1 escalation verification',
      },
    });
    assert(escalateIssue.status === 201, `escalate issue returned ${escalateIssue.status}`);
    const escalationDocument = await getLatestAuditLog('ESCALATE_ISSUE', staffTableId);
    assert(escalationDocument, 'Issue escalation audit log was not created');
    assert(
      String(escalationDocument?.actorId ?? '') === String(state.staff.user.id ?? state.staff.user._id),
      'Issue escalation actorId was not persisted correctly',
    );
    assert(escalationDocument?.metadata?.restaurantId === state.restaurantId, 'Escalation audit log restaurantId mismatch');
    assert(escalationDocument?.metadata?.entityType === 'table', 'Escalation audit log entityType mismatch');
    assert(escalationDocument?.metadata?.notes === 'Phase1 escalation verification', 'Escalation audit log notes mismatch');

    const kitchenDashboard = await request(url, 'GET', '/api/v1/kitchen/dashboard', {
      token: state.kitchen.accessToken,
    });
    assert(kitchenDashboard.status === 200, `kitchen dashboard returned ${kitchenDashboard.status}`);

    const kitchenOrders = await request(url, 'GET', '/api/v1/kitchen/orders', {
      token: state.kitchen.accessToken,
    });
    assert(kitchenOrders.status === 200, `kitchen orders returned ${kitchenOrders.status}`);

    const kitchenOrderDetails = await request(url, 'GET', `/api/v1/kitchen/orders/${state.createdOrderId}`, {
      token: state.kitchen.accessToken,
    });
    assert(kitchenOrderDetails.status === 200, `kitchen order details returned ${kitchenOrderDetails.status}`);

    const acceptOrder = await request(url, 'PATCH', `/api/v1/kitchen/orders/${state.createdOrderId}/accept`, {
      token: state.kitchen.accessToken,
      body: { estimatedPreparationTime: 12 },
    });
    assert(acceptOrder.status === 200, `accept order returned ${acceptOrder.status}`);
    assert(acceptOrder.json?.data?.order?.status === 'CONFIRMED', 'Accepted order did not return CONFIRMED status');
    assert(acceptOrder.json?.data?.order?.acceptedAt, 'Accepted order did not return acceptedAt');

    const startCooking = await request(url, 'PATCH', `/api/v1/kitchen/orders/${state.createdOrderId}/start`, {
      token: state.kitchen.accessToken,
    });
    assert(startCooking.status === 200, `start cooking returned ${startCooking.status}`);
    assert(startCooking.json?.data?.order?.status === 'PREPARING', 'Start cooking did not return PREPARING status');
    assert(
      startCooking.json?.data?.order?.preparingStartedAt,
      'Start cooking did not return preparingStartedAt',
    );

    const delayOrder = await request(url, 'PATCH', `/api/v1/kitchen/orders/${state.createdOrderId}/delay`, {
      token: state.kitchen.accessToken,
      body: { delayMinutes: 5 },
    });
    assert(delayOrder.status === 200, `delay order returned ${delayOrder.status}`);
    assert(delayOrder.json?.data?.order?.status === 'DELAYED', 'Delayed order did not return DELAYED status');
    assert(delayOrder.json?.data?.order?.delayedAt, 'Delayed order did not return delayedAt');

    const readyOrder = await request(url, 'PATCH', `/api/v1/kitchen/orders/${state.createdOrderId}/ready`, {
      token: state.kitchen.accessToken,
    });
    assert(readyOrder.status === 200, `ready order returned ${readyOrder.status}`);
    assert(readyOrder.json?.data?.order?.status === 'READY', 'Ready order did not return READY status');
    assert(readyOrder.json?.data?.order?.readyAt, 'Ready order did not return readyAt');

    const rejectOrder = await request(url, 'PATCH', `/api/v1/kitchen/orders/${state.reorderedOrderId}/reject`, {
      token: state.kitchen.accessToken,
      body: { reason: 'Verification reject path' },
    });
    assert(rejectOrder.status === 200, `reject order returned ${rejectOrder.status}`);
    assert(rejectOrder.json?.data?.order?.status === 'REJECTED', 'Rejected order did not return REJECTED status');
    assert(rejectOrder.json?.data?.order?.rejectedAt, 'Rejected order did not return rejectedAt');

    const reorderRejected = await request(url, 'POST', `/api/v1/customer/orders/${state.reorderedOrderId}/reorder`, {
      sessionToken: state.createdSessionToken,
    });
    assert(
      reorderRejected.status === 400,
      `reordering a rejected order should return 400, got ${reorderRejected.status}`,
    );

    const handledCreatedOrder = await getOrderDocument(state.createdOrderId);
    assert(handledCreatedOrder?.batchId == null, 'Created order should not have a batch before batch creation');
    assert(
      String(handledCreatedOrder?.kitchenStaffId ?? '') === String(state.kitchen.user.id ?? state.kitchen.user._id),
      'Kitchen order did not persist kitchenStaffId',
    );
    assert(handledCreatedOrder?.acceptedAt, 'Kitchen order did not persist acceptedAt');
    assert(handledCreatedOrder?.preparingStartedAt, 'Kitchen order did not persist preparingStartedAt');
    assert(handledCreatedOrder?.delayedAt, 'Kitchen order did not persist delayedAt');
    assert(handledCreatedOrder?.readyAt, 'Kitchen order did not persist readyAt');

    const rejectedOrderDocument = await getOrderDocument(state.reorderedOrderId);
    assert(rejectedOrderDocument?.status === 'REJECTED', 'Rejected order was not persisted as REJECTED');
    assert(rejectedOrderDocument?.rejectedAt, 'Rejected order did not persist rejectedAt');

    const createBatch = await request(url, 'POST', '/api/v1/kitchen/batches', {
      token: state.kitchen.accessToken,
      body: { name: 'Phase1 Verify Batch', orderIds: [state.createdOrderId], station: 'Hot Line' },
    });
    assert(createBatch.status === 201, `create batch returned ${createBatch.status}`);
    state.createdBatchId = getId(createBatch.json?.data?.batch);
    assert(state.createdBatchId, 'Created batch id missing');

    const batches = await request(url, 'GET', '/api/v1/kitchen/batches', { token: state.kitchen.accessToken });
    assert(batches.status === 200, `list batches returned ${batches.status}`);

    const batchDetails = await request(url, 'GET', `/api/v1/kitchen/batches/${state.createdBatchId}`, {
      token: state.kitchen.accessToken,
    });
    assert(batchDetails.status === 200, `batch details returned ${batchDetails.status}`);
    assert(
      (batchDetails.json?.data?.batch?.orderIds ?? []).some((orderId) => String(orderId) === state.createdOrderId),
      'Batch details did not include the created order',
    );

    const updateBatch = await request(url, 'PATCH', `/api/v1/kitchen/batches/${state.createdBatchId}`, {
      token: state.kitchen.accessToken,
      body: { name: 'Phase1 Verify Batch Updated', status: 'COMPLETE' },
    });
    assert(updateBatch.status === 200, `update batch returned ${updateBatch.status}`);
    assert(updateBatch.json?.data?.batch?.status === 'COMPLETED', 'Batch update did not normalize COMPLETE to COMPLETED');

    const batchedOrders = await request(url, 'GET', '/api/v1/kitchen/orders?batch=true', {
      token: state.kitchen.accessToken,
    });
    assert(batchedOrders.status === 200, `batched kitchen orders returned ${batchedOrders.status}`);
    assert(
      (batchedOrders.json?.data?.orders ?? []).some((order) => getId(order) === state.createdOrderId),
      'Batch-filtered kitchen orders did not include the batched order',
    );

    const batchedOrderDocument = await getOrderDocument(state.createdOrderId);
    assert(
      String(batchedOrderDocument?.batchId ?? '') === state.createdBatchId,
      'Created batch was not linked back onto the order document',
    );

    const kitchenLoad = await request(url, 'GET', '/api/v1/kitchen/load', { token: state.kitchen.accessToken });
    assert(kitchenLoad.status === 200, `kitchen load returned ${kitchenLoad.status}`);

    const kitchenPerformance = await request(url, 'GET', '/api/v1/kitchen/performance', {
      token: state.kitchen.accessToken,
    });
    assert(kitchenPerformance.status === 200, `kitchen performance returned ${kitchenPerformance.status}`);
    const kitchenChefMetrics = (kitchenPerformance.json?.data?.chefs ?? []).find(
      (chef) => String(chef?.id) === String(state.kitchen.user.id ?? state.kitchen.user._id),
    );
    assert(kitchenChefMetrics, 'Kitchen performance did not include the acting kitchen user');
    const handledOrdersCount = await ordersCollection.countDocuments({
      restaurantId: toObjectId(state.restaurantId),
      kitchenStaffId: toObjectId(state.kitchen.user.id ?? state.kitchen.user._id),
    });
    assert(
      kitchenChefMetrics.handledOrders === handledOrdersCount,
      `Kitchen performance handledOrders mismatch: expected ${handledOrdersCount}, got ${kitchenChefMetrics.handledOrders}`,
    );
    assert(kitchenChefMetrics.avgTicketMinutes >= 0, 'Kitchen performance avgTicketMinutes should be non-negative');
    assert(kitchenChefMetrics.completionRate >= 0, 'Kitchen performance completionRate should be non-negative');

    const cleaningTasks = await request(url, 'GET', '/api/v1/cleaning/tasks', {
      token: state.cleaning.accessToken,
    });
    assert(cleaningTasks.status === 200, `cleaning tasks returned ${cleaningTasks.status}`);
    state.cleaningTaskId = getId(cleaningTasks.json?.data?.tasks?.[0]);
    assert(state.cleaningTaskId, 'Cleaning task id missing');

    const cleaningTask = await request(url, 'GET', `/api/v1/cleaning/tasks/${state.cleaningTaskId}`, {
      token: state.cleaning.accessToken,
    });
    assert(cleaningTask.status === 200, `cleaning task details returned ${cleaningTask.status}`);

    const startCleaning = await request(url, 'PATCH', `/api/v1/cleaning/tasks/${state.cleaningTaskId}/start`, {
      token: state.cleaning.accessToken,
      body: { staffId: state.cleaning.user.id ?? state.cleaning.user._id },
    });
    assert(startCleaning.status === 200, `start cleaning task returned ${startCleaning.status}`);
    assert(startCleaning.json?.data?.task?.status === 'IN_PROGRESS', 'Start cleaning did not return IN_PROGRESS status');
    assert(startCleaning.json?.data?.task?.startedAt, 'Start cleaning did not return startedAt');
    assert(
      String(startCleaning.json?.data?.task?.startedBy ?? '') === String(state.cleaning.user.id ?? state.cleaning.user._id),
      'Start cleaning did not persist startedBy in the response',
    );

    const restartCleaning = await request(url, 'PATCH', `/api/v1/cleaning/tasks/${state.cleaningTaskId}/start`, {
      token: state.cleaning.accessToken,
      body: { staffId: state.cleaning.user.id ?? state.cleaning.user._id },
    });
    assert(
      restartCleaning.status === 400,
      `starting an in-progress cleaning task should return 400, got ${restartCleaning.status}`,
    );

    const cleaningTableAfterStart = await getTableDocument(String(cleaningTask.json?.data?.task?.tableId));
    assert(
      cleaningTableAfterStart?.status === 'CLEANING_IN_PROGRESS',
      'Starting cleaning did not move the table to CLEANING_IN_PROGRESS',
    );

    const completeCleaning = await request(
      url,
      'PATCH',
      `/api/v1/cleaning/tasks/${state.cleaningTaskId}/complete`,
      { token: state.cleaning.accessToken },
    );
    assert(completeCleaning.status === 200, `complete cleaning task returned ${completeCleaning.status}`);
    assert(
      completeCleaning.json?.data?.task?.status === 'COMPLETED',
      'Complete cleaning did not return COMPLETED status',
    );
    assert(completeCleaning.json?.data?.task?.completedAt, 'Complete cleaning did not return completedAt');
    assert(
      String(completeCleaning.json?.data?.task?.completedBy ?? '') === String(state.cleaning.user.id ?? state.cleaning.user._id),
      'Complete cleaning did not persist completedBy in the response',
    );

    const cleaningTableAfterComplete = await getTableDocument(String(cleaningTask.json?.data?.task?.tableId));
    assert(
      cleaningTableAfterComplete?.status === 'NEEDS_CLEANING',
      'Completing cleaning did not move the table back to NEEDS_CLEANING for verification',
    );

    const verifyCleaning = await request(url, 'PATCH', `/api/v1/cleaning/tasks/${state.cleaningTaskId}/verify`, {
      token: state.cleaning.accessToken,
      body: { verifiedBy: state.staff.user.id ?? state.staff.user._id },
    });
    assert(verifyCleaning.status === 200, `verify cleaning task returned ${verifyCleaning.status}`);
    assert(verifyCleaning.json?.data?.task?.status === 'VERIFIED', 'Verify cleaning did not return VERIFIED status');
    assert(verifyCleaning.json?.data?.task?.verifiedAt, 'Verify cleaning did not return verifiedAt');
    assert(
      String(verifyCleaning.json?.data?.task?.verifiedBy ?? '') === String(state.staff.user.id ?? state.staff.user._id),
      'Verify cleaning did not persist verifiedBy in the response',
    );

    const verifiedCleaningTask = await getLatestCleaningTask(String(cleaningTask.json?.data?.task?.tableId));
    assert(verifiedCleaningTask?.status === 'VERIFIED', 'Cleaning task was not persisted as VERIFIED');

    const cleaningTableAfterVerify = await getTableDocument(String(cleaningTask.json?.data?.task?.tableId));
    assert(cleaningTableAfterVerify?.status === 'AVAILABLE', 'Verified cleaning did not move the table to AVAILABLE');

    const platformOverview = await request(url, 'GET', '/api/v1/super-admin/platform/overview', {
      token: state.superAdmin.accessToken,
    });
    assert(platformOverview.status === 200, `platform overview returned ${platformOverview.status}`);

    const restaurants = await request(url, 'GET', '/api/v1/super-admin/restaurants?status=PENDING', {
      token: state.superAdmin.accessToken,
    });
    assert(restaurants.status === 200, `super-admin restaurants returned ${restaurants.status}`);
    state.pendingRestaurantId = getId(restaurants.json?.data?.restaurants?.[0]);
    assert(state.pendingRestaurantId, 'Pending restaurant id missing');

    const restaurantDetails = await request(
      url,
      'GET',
      `/api/v1/super-admin/restaurants/${state.pendingRestaurantId}`,
      { token: state.superAdmin.accessToken },
    );
    assert(restaurantDetails.status === 200, `super-admin restaurant details returned ${restaurantDetails.status}`);

    const approveRestaurant = await request(
      url,
      'PATCH',
      `/api/v1/super-admin/restaurants/${state.pendingRestaurantId}/approve`,
      { token: state.superAdmin.accessToken, body: { actorId: state.superAdmin.user.id ?? state.superAdmin.user._id } },
    );
    assert(approveRestaurant.status === 200, `approve restaurant returned ${approveRestaurant.status}`);

    const suspendRestaurant = await request(
      url,
      'PATCH',
      `/api/v1/super-admin/restaurants/${state.pendingRestaurantId}/suspend`,
      { token: state.superAdmin.accessToken, body: { actorId: state.superAdmin.user.id ?? state.superAdmin.user._id } },
    );
    assert(suspendRestaurant.status === 200, `suspend restaurant returned ${suspendRestaurant.status}`);

    const createPlan = await request(url, 'POST', '/api/v1/super-admin/plans', {
      token: state.superAdmin.accessToken,
      body: { name: 'PHASE1_VERIFY', priceMonthly: 9999, tenantLimit: 3 },
    });
    assert(createPlan.status === 201, `create plan returned ${createPlan.status}`);
    state.createdPlanId = getId(createPlan.json?.data?.plan);
    assert(state.createdPlanId, 'Created plan id missing');

    const plans = await request(url, 'GET', '/api/v1/super-admin/plans', {
      token: state.superAdmin.accessToken,
    });
    assert(plans.status === 200, `list plans returned ${plans.status}`);

    const updatePlan = await request(url, 'PATCH', `/api/v1/super-admin/plans/${state.createdPlanId}`, {
      token: state.superAdmin.accessToken,
      body: { priceMonthly: 10999 },
    });
    assert(updatePlan.status === 200, `update plan returned ${updatePlan.status}`);

    const revenueAnalytics = await request(url, 'GET', '/api/v1/super-admin/analytics/revenue', {
      token: state.superAdmin.accessToken,
    });
    assert(revenueAnalytics.status === 200, `revenue analytics returned ${revenueAnalytics.status}`);

    const tenantAnalytics = await request(url, 'GET', '/api/v1/super-admin/analytics/tenants', {
      token: state.superAdmin.accessToken,
    });
    assert(tenantAnalytics.status === 200, `tenant analytics returned ${tenantAnalytics.status}`);

    const monitoring = await request(url, 'GET', '/api/v1/super-admin/system/monitoring', {
      token: state.superAdmin.accessToken,
    });
    assert(monitoring.status === 200, `system monitoring returned ${monitoring.status}`);

    const auditLogs = await request(url, 'GET', '/api/v1/super-admin/audit-logs', {
      token: state.superAdmin.accessToken,
    });
    assert(auditLogs.status === 200, `audit logs returned ${auditLogs.status}`);

    const featureFlags = await request(url, 'GET', '/api/v1/super-admin/feature-flags', {
      token: state.superAdmin.accessToken,
    });
    assert(featureFlags.status === 200, `feature flags returned ${featureFlags.status}`);
    state.featureFlagId = getId(featureFlags.json?.data?.featureFlags?.[0]);
    assert(state.featureFlagId, 'Feature flag id missing');

    const updateFeatureFlag = await request(url, 'PATCH', `/api/v1/super-admin/feature-flags/${state.featureFlagId}`, {
      token: state.superAdmin.accessToken,
      body: { enabled: false },
    });
    assert(updateFeatureFlag.status === 200, `update feature flag returned ${updateFeatureFlag.status}`);

    const notifications = await request(url, 'GET', '/api/v1/notifications', {
      token: state.admin.accessToken,
    });
    assert(notifications.status === 200, `notifications returned ${notifications.status}`);
    assert((notifications.json?.data?.notifications ?? []).length > 0, 'Notifications list should not be empty for the admin user');
    assert(
      (notifications.json?.data?.notifications ?? []).some((notification) => notification?.title === 'Low stock alert'),
      'Expected seeded low stock alert notification was not returned',
    );
    state.notificationId = getId(notifications.json?.data?.notifications?.[0]);
    assert(state.notificationId, 'Notification id missing');

    const readNotification = await request(url, 'PATCH', `/api/v1/notifications/${state.notificationId}/read`, {
      token: state.admin.accessToken,
    });
    assert(readNotification.status === 200, `mark notification read returned ${readNotification.status}`);
    assert(readNotification.json?.data?.notification?.read === true, 'Read notification response did not mark the notification as read');

    const readAllNotifications = await request(url, 'PATCH', '/api/v1/notifications/read-all', {
      token: state.admin.accessToken,
    });
    assert(readAllNotifications.status === 200, `mark all notifications read returned ${readAllNotifications.status}`);
    const unreadNotificationCount = await notificationsCollection.countDocuments({
      userId: toObjectId(state.admin.user.id ?? state.admin.user._id),
      read: false,
    });
    assert(unreadNotificationCount === 0, `Expected all notifications to be read, found ${unreadNotificationCount} unread`);

    const upload = await request(url, 'POST', '/api/v1/uploads', {
      token: state.admin.accessToken,
      body: {
        fileName: 'phase1-verify.txt',
        text: 'Phase1 upload verification',
        mimeType: 'text/plain',
      },
    });
    assert(upload.status === 201, `upload returned ${upload.status}`);
    state.createdUploadUrl = upload.json?.data?.upload?.url ?? '';
    state.createdUploadFileName = upload.json?.data?.upload?.fileName ?? '';
    assert(state.createdUploadUrl, 'Upload URL missing from upload response');
    assert(state.createdUploadFileName, 'Stored upload filename missing from upload response');
    const uploadDiskPath = path.join(backendDir, state.createdUploadUrl.replace(/^\/+/, '').replaceAll('/', path.sep));
    assert(fs.existsSync(uploadDiskPath), `Uploaded file was not written to disk at ${uploadDiskPath}`);
    const uploadedFile = await request(url, 'GET', state.createdUploadUrl);
    assert(uploadedFile.status === 200, `uploaded file GET returned ${uploadedFile.status}`);
    assert(uploadedFile.raw.includes('Phase1 upload verification'), 'Uploaded file contents did not match the submitted body');

    const search = await request(url, 'GET', '/api/v1/search?q=pizza', { token: state.admin.accessToken });
    assert(search.status === 200, `search returned ${search.status}`);
    assert((search.json?.data?.menuItems ?? []).length > 0, 'Search did not return any menu items');

    const restaurantSearch = await request(url, 'GET', '/api/v1/search?q=amber', { token: state.admin.accessToken });
    assert(restaurantSearch.status === 200, `restaurant search returned ${restaurantSearch.status}`);
    assert(
      (restaurantSearch.json?.data?.restaurants ?? []).some((restaurant) => restaurant?.slug === 'amber-table'),
      'Restaurant search did not return the seeded Amber Table restaurant',
    );
  });

  await runStep('rbac and cleanup flow', async () => {
    const forbidden = await request(url, 'GET', '/api/v1/admin/tables', {
      token: state.customer.accessToken,
    });
    assert(forbidden.status === 403, `customer admin access should be 403, got ${forbidden.status}`);

    const unauthorized = await request(url, 'GET', '/api/v1/admin/tables');
    assert(unauthorized.status === 401, `missing token should be 401, got ${unauthorized.status}`);

    await tablesCollection.updateOne(
      { _id: toObjectId(state.createdTableId) },
      { $set: { status: 'PAYMENT_PENDING' } },
    );

    await ordersCollection.updateMany(
      {
        sessionId: toObjectId(state.createdSessionId),
        status: { $nin: ['CANCELLED', 'REJECTED', 'COMPLETED'] },
      },
      {
        $set: {
          status: 'PAID',
          paymentStatus: 'PAID',
          paidAt: new Date(),
        },
      },
    );

    const endCustomerSession = await request(url, 'POST', '/api/v1/customer/session/end', {
      sessionToken: state.createdSessionToken,
    });
    assert(endCustomerSession.status === 200, `end session returned ${endCustomerSession.status}`);

    const closedSession = await getSessionDocumentByToken(state.createdSessionToken);
    assert(closedSession?.status === 'CLOSED', 'Ended session was not marked CLOSED');

    const cleanedTable = await getTableDocument(state.createdTableId);
    assert(cleanedTable?.status === 'NEEDS_CLEANING', 'Ended session did not move table to NEEDS_CLEANING');
    assert(cleanedTable?.currentSessionId == null, 'Ended session did not clear currentSessionId');

    const endCleaningTask = await getLatestCleaningTask(state.createdTableId);
    assert(endCleaningTask?.status === 'PENDING', 'Ended session did not create a pending cleaning task');
    assert(endCleaningTask?.priority === 'HIGH', 'Customer cleaning request did not elevate the resulting cleaning task priority');

    const deleteTable = await request(url, 'DELETE', `/api/v1/admin/tables/${state.createdTableId}`, {
      token: state.admin.accessToken,
    });
    assert(deleteTable.status === 200, `delete created table returned ${deleteTable.status}`);

    return 'Verified RBAC plus end-session cleanup from PAYMENT_PENDING to cleaning handoff';
  });

  const passed = results.filter((entry) => entry.passed).length;
  return {
    passed,
    failed: results.length - passed,
    total: results.length,
    results,
  };
}

async function main() {
  const logPath = path.join(backendDir, 'logs', 'audit_execution_traffic.log');
  if (fs.existsSync(logPath)) {
    try {
      fs.unlinkSync(logPath);
    } catch {}
  }

  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'restaurant-automation-verify',
    },
  });
  let verifyConnection = null;

  const server = spawn(process.execPath, [path.join(backendDir, 'dist', 'server.js')], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: String(port),
      API_PREFIX: '/api/v1',
      MONGODB_URI: mongod.getUri(),
      MONGODB_CONNECT_TIMEOUT_MS: '5000',
      ALLOW_NO_DB: 'false',
      SEED_ON_STARTUP: 'true',
      JWT_SECRET: 'phase1-verify-secret',
      JWT_REFRESH_SECRET: 'phase1-verify-refresh-secret',
      COOKIE_SECRET: 'phase1-verify-cookie-secret',
      CORS_ORIGIN: 'http://localhost:5173',
      SOCKET_CORS_ORIGIN: 'http://localhost:5173',
      ENABLE_REQUEST_LOGS: 'false',
      HELMET_ENABLED: 'false',
      TRUST_PROXY: 'false',
      RATE_LIMIT_MAX: '1000',
      RATE_LIMIT_MAX_REQUESTS: '1000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '200',
      SESSION_RATE_LIMIT_MAX_REQUESTS: '1000',
      SMTP_HOST: '',
      SMTP_USER: '',
      SMTP_PASS: '',
      SMTP_FROM: 'noreply@example.com',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';
  server.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForHealth(baseUrl);
    verifyConnection = await mongoose.createConnection(mongod.getUri(), {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();
    assert(verifyConnection.db, 'Verification database connection is unavailable');

    const smoke = await runSmokeSuite(baseUrl, verifyConnection.db);
    const postman = await runNewmanSuite(baseUrl);

    const summary = {
      postman,
      smoke,
    };

    console.log(JSON.stringify(summary, null, 2));

    if (postman.failures.length > 0 || smoke.failed > 0) {
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
    server.kill('SIGTERM');
    await new Promise((resolve) => server.on('exit', resolve));
    await verifyConnection?.close();
    await mongod.stop();
  }
}

await main();
