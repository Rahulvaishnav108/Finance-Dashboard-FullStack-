import request from 'supertest';
import app from '../../app';
import { SubscriptionModel, SubscriptionStatus } from '../../modules/subscriptions/subscriptions.model';
import { PlatformPlanModel } from '../../modules/superAdmin/superAdmin.model';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { UserModel } from '../../modules/users/users.model';
import { generateTokenPair } from '../../services/jwt.service';
import { UserRole } from '../../constants/roles';

process.env.ENABLE_SUBSCRIPTION_ENFORCEMENT = 'true';

describe('Subscriptions Integration Tests', () => {
  let restaurantId: string;
  let ownerToken: string;
  let expiredRestaurantId: string;
  let expiredOwnerToken: string;

  beforeEach(async () => {

    // Setup Plan
    const plan = await PlatformPlanModel.create({
      name: 'Integration Plan',
      priceMonthly: 100,
      tenantLimit: 1,
      reservationAccess: true,
      queueAccess: true,
      advancedAnalytics: true,
      dynamicDiscountEngine: true,
      monthlyOrderLimit: 1000,
      reservationLimit: 100,
      queueLimit: 100,
      features: ['all'],
    });

    // Setup Active Restaurant
    const restaurant = await RestaurantModel.create({
      name: 'Active Rest',
      email: 'active@rest.com',
      phone: '1234567890',
      city: 'Test City',
      cuisine: 'Test Cuisine',
      plan: 'Basic',
      slug: 'active-rest-test'
    });
    restaurantId = restaurant._id.toString();

    const owner = await UserModel.create({
      name: 'Rest Owner',
      email: 'owner@rest.com',
      mobile: '1234567890',
      password: 'password123',
      role: UserRole.RESTAURANT_ADMIN,
      restaurantId,
    });
    ownerToken = generateTokenPair({ _id: owner._id.toString(), email: owner.email, role: owner.role, restaurantId }).accessToken;

    await SubscriptionModel.create({
      restaurantId,
      plan: plan.name,
      planId: plan._id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      seats: 1,
    });

    // Setup Expired Restaurant
    const expiredRestaurant = await RestaurantModel.create({
      name: 'Expired Rest',
      email: 'expired@rest.com',
      phone: '0987654321',
      city: 'Test City',
      cuisine: 'Test Cuisine',
      plan: 'Basic',
      slug: 'expired-rest-test'
    });
    expiredRestaurantId = expiredRestaurant._id.toString();

    const expiredOwner = await UserModel.create({
      name: 'Expired Owner',
      email: 'expired_owner@rest.com',
      mobile: '1112223333',
      password: 'password123',
      role: UserRole.RESTAURANT_ADMIN,
      restaurantId: expiredRestaurantId,
    });
    expiredOwnerToken = generateTokenPair({ _id: expiredOwner._id.toString(), email: expiredOwner.email, role: expiredOwner.role, restaurantId: expiredRestaurantId }).accessToken;

    await SubscriptionModel.create({
      restaurantId: expiredRestaurantId,
      plan: plan.name,
      planId: plan._id,
      status: SubscriptionStatus.EXPIRED,
      currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      seats: 1,
    });
  });

  // Database clearing is handled globally in setup.ts

  describe('Feature Access & Limits', () => {
    it('allows active subscription to access analytics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics/overview')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).not.toBe(403);
    });

    it('denies expired subscription access to analytics (P0 bypass fix)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics/overview')
        .set('Authorization', `Bearer ${expiredOwnerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('No active subscription found');
    });

    it('denies expired subscription from joining queue', async () => {
      const res = await request(app)
        .post('/api/v1/staff/queue')
        .set('Authorization', `Bearer ${expiredOwnerToken}`)
        .send({
          customerName: 'Test Queue',
          mobile: '9998887777',
          guests: 2
        });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('No active subscription found');
    });

    it('denies expired subscription from creating reservations', async () => {
      const res = await request(app)
        .post('/api/v1/staff/reservations')
        .set('Authorization', `Bearer ${expiredOwnerToken}`)
        .send({
          customerName: 'Test Customer',
          mobile: '1231231234',
          guests: 2,
          date: '2026-10-10',
          slot: '19:00'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('No active subscription found');
    });
  });

  describe('Subscription Lifecycle API', () => {
    it('can fetch current subscription details', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions/current')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(res.body.data.subscription.plan).toBe('Integration Plan');
    });
  });
});
