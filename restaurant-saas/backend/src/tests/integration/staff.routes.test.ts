import request from 'supertest';
import app from '../../app';
import { UserRole } from '../../constants/roles';
import { signAccessToken } from '../../services/jwt.service';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { UserModel } from '../../modules/users/users.model';

jest.mock('../../services/mail.service', () => ({
  sendStaffInvitationEmail: jest.fn().mockResolvedValue(true),
  sendOTPEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  verifySmtpConnection: jest.fn().mockResolvedValue(true),
}));

import { sendStaffInvitationEmail } from '../../services/mail.service';

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
    slug: 'staff-test-restaurant',
    name: 'Staff Test Restaurant',
    plan: 'PRO',
    cuisine: 'Indian',
    city: 'Delhi',
  });

  return {
    restaurantId: restaurant.id,
    token: createAdminToken(restaurant.id),
  };
}

describe('Staff Routes', () => {
  beforeEach(() => {
    (sendStaffInvitationEmail as jest.Mock).mockClear();
  });

  it('creates staff and sends an invitation email with generated password', async () => {
    const { token } = await seedAdminContext();

    const createResponse = await request(app)
      .post('/api/v1/admin/staff')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Staff Member',
        email: 'new.staff@example.com',
        mobile: '9876543210',
        role: UserRole.SERVICE_STAFF,
        // Notice password is intentionally omitted
      });

    if (createResponse.status !== 201) {
        console.error(createResponse.body);
    }

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.staff.email).toBe('new.staff@example.com');

    const createdStaff = await UserModel.findById(createResponse.body.data.staff._id).select('+password').lean();
    expect(createdStaff).toBeDefined();
    expect(createdStaff?.password).toBeDefined(); // It should have hashed the generated password

    // Check if the mock was called inside the async block
    // We need a small delay because the email sending is wrapped in an async IIFE without awaiting
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(sendStaffInvitationEmail).toHaveBeenCalledTimes(1);
    expect(sendStaffInvitationEmail).toHaveBeenCalledWith(
      'new.staff@example.com',
      'New Staff Member',
      expect.any(String), // The generated temporary password
      expect.stringContaining('/login'),
      'Staff Test Restaurant'
    );
  });
});