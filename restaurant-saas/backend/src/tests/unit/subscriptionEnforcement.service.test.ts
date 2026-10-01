import mongoose from 'mongoose';
import { assertFeatureAccess, assertPlanLimit } from '../../modules/subscriptions/subscriptionEnforcement.service';
import { SubscriptionModel, SubscriptionStatus } from '../../modules/subscriptions/subscriptions.model';
import { PlatformPlanModel } from '../../modules/superAdmin/superAdmin.model';

process.env.ENABLE_SUBSCRIPTION_ENFORCEMENT = 'true';

describe('Subscription Enforcement Service', () => {
  const restaurantId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('assertFeatureAccess', () => {
    it('throws 403 when no active subscription exists', async () => {
      jest.spyOn(SubscriptionModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(assertFeatureAccess(restaurantId, 'queueAccess', 'Queue'))
        .rejects.toThrow('No active subscription found');
    });

    it('throws 403 when feature is disabled in plan', async () => {
      jest.spyOn(SubscriptionModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ plan: 'Basic', status: SubscriptionStatus.ACTIVE }),
      } as any);

      jest.spyOn(PlatformPlanModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: 'Basic', queueAccess: false }),
      } as any);

      await expect(assertFeatureAccess(restaurantId, 'queueAccess', 'Queue'))
        .rejects.toThrow('Queue is not available on the current subscription plan');
    });

    it('resolves successfully when feature is enabled', async () => {
      jest.spyOn(SubscriptionModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ plan: 'Premium', status: SubscriptionStatus.ACTIVE }),
      } as any);

      jest.spyOn(PlatformPlanModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: 'Premium', queueAccess: true }),
      } as any);

      await expect(assertFeatureAccess(restaurantId, 'queueAccess', 'Queue')).resolves.toBeUndefined();
    });
  });

  describe('assertPlanLimit', () => {
    it('throws 403 when no active subscription exists', async () => {
      jest.spyOn(SubscriptionModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(assertPlanLimit(restaurantId, 'monthlyOrderLimit', 100, 'Orders'))
        .rejects.toThrow('No active subscription found');
    });

    it('throws 403 when limit is exceeded', async () => {
      jest.spyOn(SubscriptionModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ plan: 'Basic', status: SubscriptionStatus.ACTIVE }),
      } as any);

      jest.spyOn(PlatformPlanModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: 'Basic', monthlyOrderLimit: 100 }),
      } as any);

      await expect(assertPlanLimit(restaurantId, 'monthlyOrderLimit', 101, 'Orders'))
        .rejects.toThrow('Orders limit (100) exceeded for current subscription plan');
    });

    it('resolves successfully when limit is not exceeded', async () => {
      jest.spyOn(SubscriptionModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ plan: 'Basic', status: SubscriptionStatus.ACTIVE }),
      } as any);

      jest.spyOn(PlatformPlanModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: 'Basic', monthlyOrderLimit: 100 }),
      } as any);

      await expect(assertPlanLimit(restaurantId, 'monthlyOrderLimit', 100, 'Orders')).resolves.toBeUndefined();
    });

    it('resolves successfully when plan has no limit', async () => {
      jest.spyOn(SubscriptionModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ plan: 'Premium', status: SubscriptionStatus.ACTIVE }),
      } as any);

      jest.spyOn(PlatformPlanModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: 'Premium', monthlyOrderLimit: null }),
      } as any);

      await expect(assertPlanLimit(restaurantId, 'monthlyOrderLimit', 99999, 'Orders')).resolves.toBeUndefined();
    });
  });
});
