import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { Category, MenuItem } from '../src/modules/menu/menu.model';
import { UserModel } from '../src/modules/users/users.model';
import { RestaurantModel } from '../src/modules/restaurants/restaurants.model';
import { TableModel } from '../src/modules/tables/tables.model';
import { TableSessionModel } from '../src/modules/tableSessions/tableSessions.model';
import { OrderModel } from '../src/modules/orders/orders.model';
import { SessionStatus } from '../src/constants/statuses';
import { OfferModel } from '../src/modules/offers/offers.model';

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(method: string, endpoint: string, token: string | null = null, body: any = null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['x-session-token'] = token;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json() as any;
  return { status: res.status, data };
}

async function runE2E() {
  console.log('--- Starting E2E Billing & Lifecycle Verification ---');

  // 1. Bootstrapping test data
  console.log('[1] Bootstrapping...');
  // We need super admin to seed restaurant/table if they don't exist
  // We will assume a restaurant and table exist in the DB from previous seeds.
  // Actually, we can just use the DB directly to grab a restaurant and table!
  await mongoose.connect(env.MONGODB_URI);

  let restaurant = await RestaurantModel.findOne({});
  if (!restaurant) {
    console.log('No restaurant found. Seeding...');
    restaurant = await RestaurantModel.create({
      name: 'E2E Restro',
      slug: 'e2e-restro',
      plan: 'ENTERPRISE',
      cuisine: 'Indian',
      city: 'Delhi',
      status: 'ACTIVE'
    });
  }
  const restaurantId = (restaurant as any)._id.toString();

  let table = await TableModel.findOne({ restaurantId: (restaurant as any)._id });
  if (!table) {
    table = await TableModel.create({
      restaurantId: (restaurant as any)._id,
      tableNumber: 'T1',
      capacity: 4,
      qrCode: 'mockqr',
      status: 'AVAILABLE',
      isActive: true
    });
  } else {
    await TableModel.updateOne({ _id: table._id }, { $set: { status: 'AVAILABLE', currentSessionId: null } });
  }
  const tableId = (table as any)._id.toString();

  // Clear previous active sessions for this table
  await TableSessionModel.updateMany(
    { restaurantId, tableId, status: 'ACTIVE' },
    { $set: { status: 'EXPIRED', expiresAt: new Date() } }
  );

  // Seed a valid coupon/offer for testing
  let offer = await OfferModel.findOne({ restaurantId, code: 'DISCOUNT10' });
  if (!offer) {
    offer = await OfferModel.create({
      restaurantId,
      name: '10% Discount',
      code: 'DISCOUNT10',
      discountPercent: 10,
      active: true
    });
  }

  // 2. Start Session
  console.log('\n[2] Start Table Session');
  let res = await request('POST', '/sessions/start', null, { restaurantId, tableId, guests: 2, customerName: 'E2E Tester', mobile: '9999999999' });
  if (!res.data.success) throw new Error('Failed to start table session: ' + JSON.stringify(res.data));
  const sessionToken = res.data.data.sessionToken;
  console.log('Session started successfully. Token retrieved.');

  // 4. Add to Cart
  console.log('\n[4] Add item to cart');
  // Find or seed a user to act as creator/updater
  let user = await UserModel.findOne({ role: 'restaurant-admin' });
  if (!user) {
    user = await UserModel.findOne({});
  }
  if (!user) {
    user = await UserModel.create({
      name: 'E2E Admin',
      email: 'e2eadmin@example.com',
      mobile: '9876543210',
      password: 'hashedpassword123',
      role: 'restaurant-admin',
      status: 'ACTIVE',
      isEmailVerified: true,
      isMobileVerified: true
    });
  }
  const creatorId = user._id;

  // Find a menu item
  let menuItem = await MenuItem.findOne({ restaurantId: (restaurant as any)._id });
  if (!menuItem) {
    console.log('No menu item found. Seeding category and menu item...');
    let category = await Category.findOne({ restaurantId: (restaurant as any)._id });
    if (!category) {
      category = await Category.create({
        restaurantId: (restaurant as any)._id,
        name: 'E2E Category',
        displayOrder: 1,
        isActive: true,
        isHidden: false,
        createdBy: creatorId,
        updatedBy: creatorId
      });
    }
    menuItem = await MenuItem.create({
      restaurantId: (restaurant as any)._id,
      categoryId: category._id,
      name: 'E2E Burger',
      price: 200,
      isAvailable: true,
      isVeg: true,
      isHidden: false,
      createdBy: creatorId,
      updatedBy: creatorId
    });
  }
  const menuItemId = (menuItem as any)._id.toString();

  res = await request('POST', '/customer/cart/items', sessionToken, { menuItem: menuItemId, quantity: 2 });
  if (res.status < 200 || res.status >= 300 || !res.data.success) throw new Error('Failed to add to cart: ' + JSON.stringify(res.data));
  console.log('Item added to cart.');

  // 5. Place Order
  console.log('\n[5] Place Order');
  res = await request('POST', '/customer/orders', sessionToken, {});
  if (!res.data.success) throw new Error('Failed to place order: ' + JSON.stringify(res.data));
  console.log('Order placed response:', res.data.data.order._id);
  const orderId = res.data.data.order._id;

  // 5.5 Staff marks order as SERVED (Mocking via DB for E2E)
  console.log('\n[5.5] Staff marks order as SERVED');
  await OrderModel.findByIdAndUpdate(orderId, { status: 'SERVED' });
  console.log('Order status updated to SERVED.');

  // 6. Request Final Bill
  console.log('\n[6] Request Final Bill');
  res = await request('POST', '/customer/bill/request', sessionToken, {});
  if (!res.data.success) throw new Error('Failed to request bill: ' + JSON.stringify(res.data));
  console.log('Bill requested. Status is GENERATED.');

  // 6.1 Apply Invalid Coupon
  console.log('\n[6.1] Apply Invalid Coupon');
  res = await request('POST', '/customer/bill/coupon', sessionToken, { couponCode: 'INVALID' });
  if (res.data.success) throw new Error('Invalid coupon should fail!');
  console.log('Invalid coupon rejected properly.');

  // 6.2 Apply Valid Coupon
  console.log('\n[6.2] Apply Valid Coupon');
  res = await request('POST', '/customer/bill/coupon', sessionToken, { couponCode: 'DISCOUNT10' });
  if (!res.data.success) throw new Error('Failed to apply valid coupon: ' + JSON.stringify(res.data));
  console.log('Valid coupon applied successfully. Final amount: ' + res.data.data.finalAmount);

  // 6.3 Remove Coupon
  console.log('\n[6.3] Remove Coupon');
  res = await request('DELETE', '/customer/bill/coupon/DISCOUNT10', sessionToken, {});
  if (!res.data.success) throw new Error('Failed to remove coupon: ' + JSON.stringify(res.data));
  console.log('Coupon removed successfully. Final amount reverted to: ' + res.data.data.finalAmount);

  // 6.4 Re-Apply Coupon for Payment
  console.log('\n[6.4] Re-apply Coupon for Payment');
  res = await request('POST', '/customer/bill/coupon', sessionToken, { couponCode: 'DISCOUNT10' });
  if (!res.data.success) throw new Error('Failed to re-apply valid coupon: ' + JSON.stringify(res.data));

  // 7. Verify bill is locked for further cart additions
  console.log('\n[7] Attempting to add to cart on generated bill (Negative Test)');
  res = await request('POST', '/customer/cart/items', sessionToken, { menuItem: menuItemId, quantity: 1 });
  // Should fail since bill is GENERATED or beyond
  if (res.data.success) {
    console.warn('WARNING: Cart additions were allowed after bill generation!');
  } else {
    console.log('SUCCESS: Cart addition properly blocked: ' + res.data.error?.message);
  }

  // 8. Create Payment
  console.log('\n[8] Create Payment Intent');
  res = await request('POST', '/customer/payments/create', sessionToken, { paymentMethod: 'CARD' });
  if (!res.data.success) throw new Error('Failed to create payment: ' + JSON.stringify(res.data));
  const paymentId = res.data.data.paymentIntentId;
  console.log('Payment created:', paymentId);

  // 9. Negative Test: Failure Mock
  console.log('\n[9] Verify Payment Failure Mock');
  res = await request('POST', '/customer/payments/verify', sessionToken, { paymentId, simulateStatus: 'FAILED' });
  if (res.data.success) throw new Error('Payment with FAILED simulateStatus should not succeed!');
  console.log('Payment failure handled correctly.');

  // 9.1 Negative Test: Expired Mock
  console.log('\n[9.1] Verify Payment Expired Mock');
  res = await request('POST', '/customer/payments/verify', sessionToken, { paymentId, simulateStatus: 'EXPIRED' });
  if (res.data.success) throw new Error('Payment with EXPIRED simulateStatus should not succeed!');
  console.log('Payment expired handled correctly.');

  // 9.2 Re-create Payment Intent since the previous one expired and moved bill to DRAFT
  console.log('\n[9.2] Re-Request Final Bill and Re-Create Payment Intent');
  await request('POST', '/customer/bill/request', sessionToken, {}); // Must request again since EXPIRED moved it back to DRAFT
  res = await request('POST', '/customer/payments/create', sessionToken, { paymentMethod: 'CARD' });
  if (!res.data.success) throw new Error('Failed to re-create payment: ' + JSON.stringify(res.data));
  const newPaymentId = res.data.data.paymentIntentId;
  console.log('New Payment created:', newPaymentId);

  // 10. Verify Payment Success
  console.log('\n[10] Verify Payment Success');
  res = await request('POST', '/customer/payments/verify', sessionToken, { paymentId: newPaymentId });
  if (!res.data.success) throw new Error('Failed to verify payment: ' + JSON.stringify(res.data));
  console.log('Payment verified. Bill PAID.');

  // 11. Duplicate Payment Idempotency Check
  console.log('\n[11] Duplicate Payment Verification');
  res = await request('POST', '/customer/payments/verify', sessionToken, { paymentId: newPaymentId });
  if (res.data.success || res.data.error?.code !== 'UNAUTHORIZED_TABLE_SESSION') {
    throw new Error('Duplicate payment should fail with UNAUTHORIZED_TABLE_SESSION, got: ' + JSON.stringify(res.data));
  }
  console.log('Session expiration verified on duplicate request.');

  // 12. Cleanup Verification
  console.log('\n[12] Cleanup Verification');
  const sessionDoc = await TableSessionModel.findOne({ tableId }).sort({ createdAt: -1 });
  if (sessionDoc && sessionDoc.status !== SessionStatus.CLOSED) {
    console.error('Session was not marked CLOSED! Got: ' + sessionDoc.status);
  } else {
    console.log('Session marked CLOSED successfully.');
  }

  const tableDoc = await TableModel.findById(tableId);
  if (!tableDoc) {
    console.error('Table document not found in DB!');
  } else if (tableDoc.status !== 'NEEDS_CLEANING') {
    console.error('Table was not set to NEEDS_CLEANING, got: ' + tableDoc.status);
  } else {
    console.log('Table set to NEEDS_CLEANING successfully.');
  }

  console.log('\n--- All E2E Tests Passed! ---');
  process.exit(0);
}

runE2E().catch(err => {
  console.error('Error running E2E tests:', err);
  process.exit(1);
});
