import { jest } from '@jest/globals';
import { PlatformPlanModel } from '../../modules/superAdmin/superAdmin.model';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { SubscriptionModel } from '../../modules/subscriptions/subscriptions.model';
import * as Service from '../../modules/subscriptions/subscriptions.service';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';

jest.mock('../../modules/subscriptions/subscriptions.model', () => ({
  BillingCycle: {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
  },
  SubscriptionEventType: {
    CREATED: 'CREATED',
    UPDATED: 'UPDATED',
    ACTIVATED: 'ACTIVATED',
    UPGRADED: 'UPGRADED',
    DOWNGRADED: 'DOWNGRADED',
    CANCELLED: 'CANCELLED',
    CANCELLATION_SCHEDULED: 'CANCELLATION_SCHEDULED',
    RENEWED: 'RENEWED',
    EXPIRED: 'EXPIRED',
    USAGE_RECORDED: 'USAGE_RECORDED',
    LIMIT_WARNING: 'LIMIT_WARNING',
    LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
    FEATURE_BLOCKED: 'FEATURE_BLOCKED',
    PAYMENT_CREATED: 'PAYMENT_CREATED',
    PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    AUTO_RENEWAL_SKIPPED: 'AUTO_RENEWAL_SKIPPED',
  },
  SubscriptionPaymentProvider: {
    MANUAL: 'manual',
    MOCK: 'mock',
    RAZORPAY: 'razorpay',
    STRIPE: 'stripe',
  },
  SubscriptionPaymentStatus: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },
  SubscriptionStatus: {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    PAST_DUE: 'past_due',
    SUSPENDED: 'suspended',
    EXPIRED: 'expired',
  },
  SubscriptionModel: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  },
  SubscriptionEventModel: {
    create: jest.fn(),
  },
  SubscriptionPaymentModel: {
    create: jest.fn(),
  },
}));

jest.mock('../../modules/superAdmin/superAdmin.model', () => ({
  PlatformPlanModel: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../modules/restaurants/restaurants.model', () => ({
  RestaurantModel: {
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../../modules/notifications/notifications.service', () => ({
  NotificationsService: {
    createNotification: jest.fn(),
  },
}));

const mockSubscriptionModel = SubscriptionModel as any;
const mockPlatformPlanModel = PlatformPlanModel as any;
const mockRestaurantModel = RestaurantModel as any;
const mockNotificationsService = NotificationsService as any;

describe('SubscriptionService', () => {
  const restaurantId = 'rest_1';
  const subscriptionInput = {
    restaurantId,
    plan: 'STARTER',
    currentPeriodEnd: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('throws when subscription already exists', async () => {
      mockSubscriptionModel.findOne.mockResolvedValueOnce({});

      await expect(Service.createSubscription(subscriptionInput)).rejects.toThrow(AppError);
      expect(mockSubscriptionModel.findOne).toHaveBeenCalledWith({ restaurantId });
    });

    it('throws when plan tenant limit is exceeded', async () => {
      mockSubscriptionModel.findOne.mockResolvedValueOnce(null);
      const mockLean = jest.fn() as any;
      mockLean.mockResolvedValueOnce({ _id: 'plan_1', name: 'STARTER', tenantLimit: 1 });
      mockPlatformPlanModel.findOne.mockReturnValueOnce({ lean: mockLean });

      await expect(
        Service.createSubscription({ ...subscriptionInput, seats: 2 }),
      ).rejects.toThrow(AppError);
      expect(mockPlatformPlanModel.findOne).toHaveBeenCalledWith({ name: 'STARTER' });
    });

    it('creates subscription when seats are within tenant limit', async () => {
      const mockSubscription = { _id: 'sub_1', ...subscriptionInput, seats: 1 };
      mockSubscriptionModel.findOne.mockResolvedValueOnce(null);
      const mockLean = jest.fn() as any;
      mockLean.mockResolvedValueOnce({ name: 'STARTER', tenantLimit: 1 });
      mockPlatformPlanModel.findOne.mockReturnValueOnce({ lean: mockLean });
      mockSubscriptionModel.create.mockResolvedValueOnce(mockSubscription);

      const result = await Service.createSubscription({ ...subscriptionInput, seats: 1 });

      expect(result).toBe(mockSubscription);
      expect(mockSubscriptionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ restaurantId, plan: 'STARTER', seats: 1 }),
      );
      expect(mockRestaurantModel.findByIdAndUpdate).toHaveBeenCalledWith(restaurantId, { plan: 'STARTER' }, { new: true });
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId,
          recipientRole: expect.any(String),
          title: 'Subscription created',
        }),
      );
    });
  });

  describe('updateSubscription', () => {
    it('throws when subscription does not exist', async () => {
      mockSubscriptionModel.findById.mockResolvedValueOnce(null);

      await expect(Service.updateSubscription('sub_id', { seats: 1 })).rejects.toThrow(AppError);
      expect(mockSubscriptionModel.findById).toHaveBeenCalledWith('sub_id');
    });

    it('throws when updating seats above tenant limit', async () => {
      const existingSubscription = { _id: 'sub_1', restaurantId, plan: 'STARTER', seats: 1 };
      mockSubscriptionModel.findById.mockResolvedValueOnce(existingSubscription);
      const mockLean = jest.fn() as any;
      mockLean.mockResolvedValueOnce({ name: 'STARTER', tenantLimit: 1 });
      mockPlatformPlanModel.findOne.mockReturnValueOnce({ lean: mockLean });

      await expect(Service.updateSubscription('sub_id', { seats: 2 })).rejects.toThrow(AppError);
    });

    it('updates subscription when seats are valid', async () => {
      const existingSubscription = { _id: 'sub_1', restaurantId, plan: 'STARTER', seats: 1 };
      const updatedSubscription = { ...existingSubscription, seats: 1 };
      mockSubscriptionModel.findById.mockResolvedValueOnce(existingSubscription);
      const mockLean = jest.fn() as any;
      mockLean.mockResolvedValueOnce({ name: 'STARTER', tenantLimit: 1 });
      mockPlatformPlanModel.findOne.mockReturnValueOnce({ lean: mockLean });
      mockSubscriptionModel.findByIdAndUpdate.mockResolvedValueOnce(updatedSubscription);

      const result = await Service.updateSubscription('sub_id', { seats: 1 });

      expect(result).toBe(updatedSubscription);
      expect(mockSubscriptionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'sub_id',
        { seats: 1 },
        { new: true, runValidators: true },
      );
      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('increments usage for active subscription', async () => {
      const existingSubscription = { _id: 'sub_1', status: 'active', plan: 'STARTER', usage: { pages: 2 } };
      const updatedSubscription = { _id: 'sub_1', restaurantId, status: 'active', plan: 'STARTER', usage: { pages: 3 } };
      const mockLean = jest.fn() as any;

      mockSubscriptionModel.findById.mockResolvedValueOnce(existingSubscription);
      mockLean.mockResolvedValueOnce({ name: 'STARTER', tenantLimit: 1, usageLimit: 5 });
      mockPlatformPlanModel.findOne.mockReturnValueOnce({ lean: mockLean } as any);
      mockSubscriptionModel.updateOne.mockResolvedValueOnce({});
      mockSubscriptionModel.findById.mockResolvedValueOnce(updatedSubscription);

      const result = await Service.incrementUsage('sub_id', 'pages', 1);

      expect(result).toBe(updatedSubscription);
      expect(mockSubscriptionModel.updateOne).toHaveBeenCalledWith(
        { _id: 'sub_id' },
        { $inc: { 'usage.pages': 1 } },
      );
    });

    it('throws when incrementing usage above plan limit', async () => {
      const existingSubscription = { _id: 'sub_1', restaurantId, status: 'active', plan: 'STARTER', usage: { pages: 5 } };
      const mockLean = jest.fn() as any;

      mockSubscriptionModel.findById.mockResolvedValueOnce(existingSubscription);
      mockLean.mockResolvedValueOnce({ name: 'STARTER', tenantLimit: 1, usageLimit: 5 });
      mockPlatformPlanModel.findOne.mockReturnValueOnce({ lean: mockLean } as any);

      await expect(Service.incrementUsage('sub_id', 'pages', 1)).rejects.toMatchObject({ code: ErrorCode.USAGE_LIMIT_EXCEEDED });
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId,
          title: 'Subscription usage limit reached',
          type: 'SUBSCRIPTION_USAGE_LIMIT_EXCEEDED',
        }),
      );
    });

    it('throws when incrementing usage for inactive subscription', async () => {
      const inactiveSubscription = { _id: 'sub_1', status: 'cancelled', usage: { pages: 2 } };
      mockSubscriptionModel.findById.mockResolvedValueOnce(inactiveSubscription);

      await expect(Service.incrementUsage('sub_id', 'pages', 1)).rejects.toThrow(AppError);
    });

    it('returns usage for an existing subscription', async () => {
      const usage = { pages: 10, items: 5 };
      mockSubscriptionModel.findById.mockResolvedValueOnce({ _id: 'sub_id', usage } as any);

      const result = await Service.getSubscriptionUsage('sub_id');

      expect(result).toEqual(usage);
      expect(mockSubscriptionModel.findById).toHaveBeenCalledWith('sub_id');
    });

    it('throws when getting usage for an unknown subscription', async () => {
      mockSubscriptionModel.findById.mockResolvedValueOnce(null);

      await expect(Service.getSubscriptionUsage('sub_id')).rejects.toThrow(AppError);
    });
  });
});
