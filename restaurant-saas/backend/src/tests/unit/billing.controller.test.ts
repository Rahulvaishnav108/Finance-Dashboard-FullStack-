import { Request, Response } from 'express';
import { BillingController } from '../../modules/billing/billing.controller';
import { BillingService } from '../../modules/billing/billing.service';
import { AppError } from '../../utils/AppError';

jest.mock('../../modules/billing/billing.service');

describe('BillingController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      tableSession: {
        _id: 'session123',
        restaurantId: 'rest123',
      } as any,
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('throws validation error if customerEmail is invalid', async () => {
      req.body = {
        paymentMethod: 'ONLINE',
        customerEmail: 'invalid-email',
      };

      await BillingController.createPayment(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid email format');
    });

    it('trims and lowercases customerEmail and passes it to service', async () => {
      req.body = {
        paymentMethod: 'ONLINE',
        customerEmail: '  TeSt@ExAmPle.COM  ',
      };

      (BillingService.createPayment as jest.Mock).mockResolvedValue({ id: 'bill1' });

      await BillingController.createPayment(req as Request, res as Response, next);

      expect(BillingService.createPayment).toHaveBeenCalledWith('rest123', 'session123', 'ONLINE', 'test@example.com');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('requestFinalBill', () => {
    it('throws validation error if customerEmail is invalid', async () => {
      req.body = {
        customerEmail: 'missing-at.com',
      };

      await BillingController.requestFinalBill(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid email format');
    });

    it('passes customerEmail to service', async () => {
      req.body = {
        customerEmail: 'valid@example.com',
      };

      (BillingService.requestFinalBill as jest.Mock).mockResolvedValue({ id: 'bill1' });

      await BillingController.requestFinalBill(req as Request, res as Response, next);

      expect(BillingService.requestFinalBill).toHaveBeenCalledWith('rest123', 'session123', 'valid@example.com', false);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});