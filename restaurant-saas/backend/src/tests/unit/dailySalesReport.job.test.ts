import { getPreviousDayTimeRange, processDailySalesReports } from '../../jobs/dailySalesReport.job';
import { RestaurantModel } from '../../modules/restaurants/restaurants.model';
import { UserModel } from '../../modules/users/users.model';
import { OrderModel } from '../../modules/orders/orders.model';
import { BillingModel } from '../../modules/billing/billing.model';
import mongoose from 'mongoose';
import { sendDailySalesReportEmail } from '../../services/mail.service';
import { UserRole } from '../../constants/roles';
import { OrderStatus } from '../../modules/orders/orders.schema';

// Mock dependencies
jest.mock('../../modules/restaurants/restaurants.model');
jest.mock('../../modules/users/users.model');
jest.mock('../../modules/orders/orders.model');
jest.mock('../../modules/billing/billing.model');
jest.mock('../../services/mail.service');

// Mock DailyReportLogModel using standard jest.mock block without external hoisted variables
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  const findOneMock = jest.fn();
  const createMock = jest.fn();

  return {
    ...actualMongoose,
    models: {
      DailyReportLog: {
        findOne: () => ({
          lean: findOneMock,
        }),
        create: createMock,
      },
    },
    // Export them for test assertions
    __findOneMock: findOneMock,
    __createMock: createMock,
  };
});

describe('dailySalesReport.job', () => {
  let mockDailyReportLogFindOne: jest.Mock;
  let mockDailyReportLogCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (sendDailySalesReportEmail as jest.Mock).mockResolvedValue(true);

    // Retrieve mocks from mongoose
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mongooseMock = require('mongoose');
    mockDailyReportLogFindOne = mongooseMock.__findOneMock;
    mockDailyReportLogCreate = mongooseMock.__createMock;
    mockDailyReportLogFindOne.mockReset();
    mockDailyReportLogCreate.mockReset();
  });

  describe('getPreviousDayTimeRange', () => {
    it('returns valid startOfDay, endOfDay, and reportDate based on IST', () => {
      const { startOfDay, endOfDay, reportDate } = getPreviousDayTimeRange();

      expect(startOfDay).toBeInstanceOf(Date);
      expect(endOfDay).toBeInstanceOf(Date);
      expect(typeof reportDate).toBe('string');
      expect(reportDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(startOfDay.getTime()).toBeLessThan(endOfDay.getTime());
    });
  });

  describe('processDailySalesReports', () => {
    it('processes restaurants and sends daily sales reports', async () => {
      const mockRestaurant = { _id: new mongoose.Types.ObjectId(), name: 'Test Restaurant', isActive: true };

      (RestaurantModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockRestaurant])
      });

      mockDailyReportLogFindOne.mockResolvedValue(null);

      // Mock Bills
      (BillingModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { finalAmount: 100 },
          { finalAmount: 200 }
        ])
      });

      // Mock Orders
      (OrderModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            status: OrderStatus.COMPLETED,
            items: [{ name: 'Pizza', quantity: 2 }]
          },
          {
            status: OrderStatus.CANCELLED,
            items: [{ name: 'Burger', quantity: 1 }]
          },
          {
            status: OrderStatus.COMPLETED,
            items: [{ name: 'Pizza', quantity: 1 }, { name: 'Fries', quantity: 1 }]
          }
        ])
      });

      // Mock Admins
      (UserModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { email: 'admin1@test.com', role: UserRole.RESTAURANT_ADMIN }
        ])
      });

      await processDailySalesReports();

      expect(sendDailySalesReportEmail).toHaveBeenCalledTimes(1);
      expect(sendDailySalesReportEmail).toHaveBeenCalledWith(
        'admin1@test.com',
        'Test Restaurant',
        expect.any(String),
        3, // totalOrders
        300, // revenue
        2, // paidBills
        1, // cancelledOrders
        150, // averageOrderValue (300/2)
        expect.arrayContaining([
          { name: 'Pizza', quantity: 3 },
          { name: 'Fries', quantity: 1 }
        ])
      );

      expect(mockDailyReportLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId: mockRestaurant._id,
        })
      );
    });

    it('skips processing if report already sent (idempotency)', async () => {
      const mockRestaurant = { _id: new mongoose.Types.ObjectId(), name: 'Test Restaurant', isActive: true };

      (RestaurantModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockRestaurant])
      });

      // Mock existing log
      mockDailyReportLogFindOne.mockResolvedValue({ _id: 'some_id' });

      await processDailySalesReports();

      expect(BillingModel.find).not.toHaveBeenCalled();
      expect(sendDailySalesReportEmail).not.toHaveBeenCalled();
      expect(mockDailyReportLogCreate).not.toHaveBeenCalled();
    });

    it('handles failure for one restaurant and continues to next', async () => {
      const mockRestaurant1 = { _id: new mongoose.Types.ObjectId(), name: 'Test Restaurant 1', isActive: true };
      const mockRestaurant2 = { _id: new mongoose.Types.ObjectId(), name: 'Test Restaurant 2', isActive: true };

      (RestaurantModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockRestaurant1, mockRestaurant2])
      });

      // Fail on first restaurant's log check
      mockDailyReportLogFindOne
        .mockRejectedValueOnce(new Error('DB Error')) // Fails Restaurant 1
        .mockResolvedValueOnce(null); // Succeeds Restaurant 2

      (BillingModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });
      (OrderModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });
      (UserModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { email: 'admin2@test.com' }
        ])
      });

      await processDailySalesReports();

      // Should still attempt to send email for the second restaurant
      expect(sendDailySalesReportEmail).toHaveBeenCalledTimes(1);
    });
  });
});