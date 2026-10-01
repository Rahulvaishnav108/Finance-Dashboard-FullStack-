import request from 'supertest';
import app from '../../app';
import { UserRole } from '../../constants/roles';
import { signAccessToken } from '../../services/jwt.service';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { UserModel } from '../../modules/users/users.model';
import { StaffShiftAssignmentModel } from '../../modules/staff/staff.model';

function createAdminToken(restaurantId: string): string {
  return signAccessToken({
    _id: '507f1f77bcf86cd799439011',
    email: 'admin@example.com',
    role: UserRole.RESTAURANT_ADMIN,
    restaurantId,
  });
}

async function seedAdminContext() {
  const restaurant = await RestaurantModel.create({
    slug: 'north-spice',
    name: 'North Spice',
    plan: 'PRO',
    cuisine: 'Indian',
    city: 'Delhi',
  });

  const staff = await UserModel.create({
    restaurantId: restaurant._id,
    name: 'Riya Service',
    email: 'riya.service@example.com',
    mobile: '9999990001',
    password: 'hashed-password',
    role: UserRole.SERVICE_STAFF,
  });

  await StaffShiftAssignmentModel.create({
    restaurantId: restaurant._id,
    staffId: staff._id,
    name: 'Lunch Shift',
    startTime: '09:00',
    endTime: '17:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    active: true,
  });

  return {
    restaurantId: restaurant.id,
    token: createAdminToken(restaurant.id),
  };
}

describe('Admin staff attendance/performance and loyalty routes', () => {
  it('returns documented admin staff attendance and performance payloads', async () => {
    const { token } = await seedAdminContext();

    const attendanceResponse = await request(app)
      .get('/api/v1/admin/staff/attendance')
      .set('Authorization', `Bearer ${token}`);

    expect(attendanceResponse.status).toBe(200);
    expect(attendanceResponse.body.success).toBe(true);
    expect(attendanceResponse.body.data.attendance).toHaveLength(1);
    expect(attendanceResponse.body.data.attendance[0]).toMatchObject({
      name: 'Riya Service',
      role: UserRole.SERVICE_STAFF,
      activeShift: expect.objectContaining({
        name: 'Lunch Shift',
      }),
    });

    const performanceResponse = await request(app)
      .get('/api/v1/admin/staff/performance')
      .set('Authorization', `Bearer ${token}`);

    expect(performanceResponse.status).toBe(200);
    expect(performanceResponse.body.success).toBe(true);
    expect(performanceResponse.body.data.performance).toHaveLength(1);
    expect(performanceResponse.body.data.performance[0]).toMatchObject({
      name: 'Riya Service',
      role: UserRole.SERVICE_STAFF,
      serviceOrders: 0,
      acceptedRequests: 0,
      completedRequests: 0,
    });
  });

  it('creates and lists documented loyalty rules for admin scope', async () => {
    const { token } = await seedAdminContext();

    const createResponse = await request(app)
      .post('/api/v1/admin/loyalty/rules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Premium Visits',
        pointsPerAmount: 10,
        minimumOrderAmount: 150,
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.rule).toMatchObject({
      name: 'Premium Visits',
      pointsPerAmount: 10,
      minimumOrderAmount: 150,
      active: true,
    });

    const listResponse = await request(app)
      .get('/api/v1/admin/loyalty/rules')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data.rules).toHaveLength(1);
    expect(listResponse.body.data.rules[0]).toMatchObject({
      name: 'Premium Visits',
      pointsPerAmount: 10,
    });
  });
});
