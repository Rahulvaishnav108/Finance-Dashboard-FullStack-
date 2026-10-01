import request from 'supertest';
import { signAccessToken } from '../../services/jwt.service';
import { UserRole } from '../../constants/roles';
import app from '../../app';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { SupplierModel } from '../../modules/suppliers/supplier.model';

function createAdminToken(restaurantId: string): string {
  return signAccessToken({
    _id: '507f1f77bcf86cd799439011',
    email: 'admin@example.com',
    role: UserRole.RESTAURANT_ADMIN,
    restaurantId,
  });
}

function createStaffToken(restaurantId: string): string {
  return signAccessToken({
    _id: '507f1f77bcf86cd799439012',
    email: 'staff@example.com',
    role: UserRole.SERVICE_STAFF,
    restaurantId,
  });
}

async function seedRestaurant() {
  return RestaurantModel.create({
    slug: 'supplier-test-rest',
    name: 'Supplier Test Rest',
    plan: 'PRO',
    cuisine: 'Mixed',
    city: 'New York',
  });
}

describe('Supplier Routes Integration', () => {
  let restaurant: any;
  let token: string;
  let staffToken: string;

  beforeEach(async () => {
    restaurant = await seedRestaurant();
    token = createAdminToken(restaurant.id);
    staffToken = createStaffToken(restaurant.id);
  });

  it('rejects unauthenticated requests', async () => {
    const response = await request(app).get('/api/v1/admin/suppliers');
    expect(response.status).toBe(401);
  });

  it('rejects unauthorized role requests', async () => {
    const response = await request(app)
      .get('/api/v1/admin/suppliers')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(response.status).toBe(403);
  });

  it('creates a supplier successfully', async () => {
    const response = await request(app)
      .post('/api/v1/admin/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Veggie Corp',
        phone: '+1234567890',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.supplier.name).toBe('Veggie Corp');
  });

  it('fetches suppliers correctly', async () => {
    await SupplierModel.create({ restaurantId: restaurant.id, name: 'Veggie Corp', phone: '123' });

    const response = await request(app)
      .get('/api/v1/admin/suppliers')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.suppliers.length).toBeGreaterThan(0);
    expect(response.body.data.suppliers[0].name).toBe('Veggie Corp');
  });

  it('updates a supplier successfully', async () => {
    const supplier = await SupplierModel.create({ restaurantId: restaurant.id, name: 'Veggie Corp', phone: '123' });

    const response = await request(app)
      .patch(`/api/v1/admin/suppliers/${supplier._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone: '+1987654321',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.supplier.phone).toBe('+1987654321');
  });

  it('deletes a supplier successfully', async () => {
    const supplier = await SupplierModel.create({ restaurantId: restaurant.id, name: 'Veggie Corp', phone: '123' });

    const response = await request(app)
      .delete(`/api/v1/admin/suppliers/${supplier._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.message).toContain('successfully deleted');

    const check = await SupplierModel.findById(supplier._id);
    expect(check?.active).toBe(false);
    expect(check?.deletedAt).toBeDefined();
  });
});
