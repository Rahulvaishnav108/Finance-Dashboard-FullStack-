import request from 'supertest';
import { signAccessToken } from '../../services/jwt.service';
import { UserRole } from '../../constants/roles';
import app from '../../app';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { InventoryItemModel } from '../../modules/inventory/inventory.model';
import { UserModel } from '../../modules/users/users.model';

jest.mock('../../services/mail.service', () => ({
  sendLowStockAlertEmail: jest.fn().mockResolvedValue(true),
}));

import { sendLowStockAlertEmail } from '../../services/mail.service';

function createAdminToken(restaurantId: string): string {
  return signAccessToken({
    _id: '507f1f77bcf86cd799439011',
    email: 'admin@example.com',
    role: UserRole.RESTAURANT_ADMIN,
    restaurantId,
  });
}

function createKitchenToken(restaurantId: string): string {
  return signAccessToken({
    _id: '507f1f77bcf86cd799439013',
    email: 'kitchen@example.com',
    role: UserRole.KITCHEN_STAFF,
    restaurantId,
  });
}

function createWaitStaffToken(restaurantId: string): string {
  return signAccessToken({
    _id: '507f1f77bcf86cd799439014',
    email: 'waitstaff@example.com',
    role: UserRole.SERVICE_STAFF,
    restaurantId,
  });
}

async function seedRestaurant() {
  const restaurant = await RestaurantModel.create({
    slug: 'inventory-test-rest',
    name: 'Inventory Test Rest',
    plan: 'PRO',
    cuisine: 'Mixed',
    city: 'Mumbai',
  });

  await UserModel.create({
    restaurantId: restaurant._id,
    name: 'Admin User',
    email: 'admin@example.com',
    mobile: '9999999999',
    password: 'password',
    role: UserRole.RESTAURANT_ADMIN,
  });

  return restaurant;
}

describe('Inventory Routes Integration', () => {
  let restaurant: any;
  let adminToken: string;
  let kitchenToken: string;
  let waitStaffToken: string;

  beforeEach(async () => {
    restaurant = await seedRestaurant();
    adminToken = createAdminToken(restaurant.id);
    kitchenToken = createKitchenToken(restaurant.id);
    waitStaffToken = createWaitStaffToken(restaurant.id);
  });

  describe('Admin Inventory Endpoints', () => {
    it('creates an inventory item (Admin)', async () => {
      const response = await request(app)
        .post('/api/v1/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Onions',
          stock: 50,
          unit: 'kg',
          threshold: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.item.name).toBe('Onions');
    });

    it('rejects unauthorized role (Wait Staff) from creating item', async () => {
      const response = await request(app)
        .post('/api/v1/admin/inventory')
        .set('Authorization', `Bearer ${waitStaffToken}`)
        .send({
          name: 'Garlic',
          stock: 10,
          unit: 'kg',
          threshold: 2,
        });

      expect(response.status).toBe(403);
    });

    it('fetches inventory items (Admin)', async () => {
      await InventoryItemModel.create({ restaurantId: restaurant.id, name: 'Onions', stock: 50, threshold: 10, unit: 'kg' });

      const response = await request(app)
        .get('/api/v1/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('fetches inventory stats (Admin)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/inventory/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.stats).toBeDefined();
    });
  });

  describe('Kitchen Inventory Endpoints (Phase 8)', () => {
    it('allows Kitchen Staff to access inventory', async () => {
      await InventoryItemModel.create({ restaurantId: restaurant.id, name: 'Onions', stock: 50, threshold: 10, unit: 'kg' });

      const response = await request(app)
        .get('/api/v1/kitchen/inventory')
        .set('Authorization', `Bearer ${kitchenToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.items).toBeDefined();
    });

    it('allows Kitchen Staff to access inventory alerts', async () => {
      await InventoryItemModel.create({ restaurantId: restaurant.id, name: 'LowOnions', stock: 5, threshold: 10, unit: 'kg' });

      const response = await request(app)
        .get('/api/v1/kitchen/inventory/alerts')
        .set('Authorization', `Bearer ${kitchenToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.alerts).toBeDefined();
    });

    it('allows Restaurant Admin to access kitchen inventory endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/kitchen/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('denies Wait Staff from accessing kitchen inventory endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/kitchen/inventory')
        .set('Authorization', `Bearer ${waitStaffToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Low Stock Email Trigger', () => {
    it('sends an email to the admin when an item falls below its threshold', async () => {
      (sendLowStockAlertEmail as jest.Mock).mockClear();

      const createResponse = await request(app)
        .post('/api/v1/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Cheese',
          stock: 50,
          unit: 'kg',
          threshold: 10,
          category: 'DAIRY',
        });

      expect(createResponse.status).toBe(201);
      const itemId = createResponse.body.data.item._id;

      const updateResponse = await request(app)
        .patch(`/api/v1/admin/inventory/${itemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 5 }); // Falls below threshold of 10

      expect(updateResponse.status).toBe(200);

      // Wait a bit for the async email trigger
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(sendLowStockAlertEmail).toHaveBeenCalledTimes(1);
      expect(sendLowStockAlertEmail).toHaveBeenCalledWith(
        'admin@example.com',
        'Inventory Test Rest',
        'Cheese',
        5,
        10,
        'kg'
      );
    });
  });
});