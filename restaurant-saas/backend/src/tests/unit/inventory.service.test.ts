import mongoose, { Types } from 'mongoose';
import { InventoryService } from '../../modules/inventory/inventory.service';
import { InventoryItemModel } from '../../modules/inventory/inventory.model';
import { InventoryTransactionService } from '../../modules/inventory/inventoryTransaction.service';
import { logAuditRaw } from '../../modules/auditLogs/auditLogs.helper';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { AppError } from '../../utils/AppError';

jest.mock('../../modules/inventory/inventory.model');
jest.mock('../../modules/inventory/inventoryTransaction.service');
jest.mock('../../modules/inventory/inventoryTransaction.model');
jest.mock('../../modules/auditLogs/auditLogs.helper');
jest.mock('../../modules/notifications/notifications.service');
jest.mock('../../modules/subscriptions/subscriptionEnforcement.service', () => ({
  assertPlanLimit: jest.fn().mockResolvedValue(undefined),
  assertFeatureAccess: jest.fn().mockResolvedValue(undefined),
  recordSubscriptionUsage: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('mongoose', () => {
  const original = jest.requireActual('mongoose');
  return {
    ...original,
    startSession: jest.fn(),
  };
});

describe('InventoryService', () => {
  const restaurantId = new Types.ObjectId().toString();
  const actor = { id: 'user1', role: 'ADMIN' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventoryItem', () => {
    it('throws error if item already exists', async () => {
      (InventoryItemModel.exists as jest.Mock).mockResolvedValueOnce(true);

      await expect(
        InventoryService.createInventoryItem(restaurantId, { name: 'Tomato' }, actor)
      ).rejects.toThrow(AppError);
    });

    it('creates item, records transaction, and logs audit', async () => {
      (InventoryItemModel.exists as jest.Mock).mockResolvedValueOnce(false);
      const mockItem = { _id: new Types.ObjectId(), name: 'Tomato', stock: 10, threshold: 5 };
      (InventoryItemModel.create as jest.Mock).mockResolvedValueOnce(mockItem);

      const result = await InventoryService.createInventoryItem(restaurantId, { name: 'Tomato', stock: 10, threshold: 5 }, actor);

      expect(result).toBe(mockItem);
      expect(InventoryTransactionService.recordTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', newStock: 10 })
      );
      expect(logAuditRaw).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_INVENTORY_CREATED' })
      );
    });
  });

  describe('updateInventoryItem', () => {
    const itemId = new Types.ObjectId().toString();

    it('throws error if item not found', async () => {
      (InventoryItemModel.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        InventoryService.updateInventoryItem(restaurantId, itemId, { stock: 20 }, actor)
      ).rejects.toThrow(AppError);
    });

    it('updates item, records transaction if stock changed, and logs audit', async () => {
      const mockItem = {
        _id: itemId,
        stock: 10,
        threshold: 5,
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({ _id: itemId, stock: 20 }),
      };
      (InventoryItemModel.findOne as jest.Mock).mockResolvedValueOnce(mockItem);

      await InventoryService.updateInventoryItem(restaurantId, itemId, { stock: 20 }, actor);

      expect(mockItem.save).toHaveBeenCalled();
      expect(InventoryTransactionService.recordTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MANUAL_ADJUSTMENT', previousStock: 10, newStock: 20 })
      );
      expect(logAuditRaw).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_INVENTORY_UPDATED' })
      );
    });
  });

  describe('deleteInventoryItem', () => {
    const itemId = new Types.ObjectId().toString();

    it('soft deletes item and logs audit', async () => {
      const mockItem = { _id: itemId };
      (InventoryItemModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockItem);

      await InventoryService.deleteInventoryItem(restaurantId, itemId, actor);

      expect(InventoryItemModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: itemId, restaurantId },
        { active: false, deletedAt: expect.any(Date), isLowStock: false },
        { new: true }
      );
      expect(logAuditRaw).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_INVENTORY_DELETED' })
      );
    });
  });

  describe('deductStock and restoreStock', () => {
    it('deductStock reduces stock and sends alert if below threshold', async () => {
      (NotificationsService.createNotification as jest.Mock).mockResolvedValueOnce({});
      const mockSession = { startTransaction: jest.fn(), commitTransaction: jest.fn(), abortTransaction: jest.fn(), endSession: jest.fn() };
      (mongoose.startSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const itemId = new Types.ObjectId().toString();
      const mockItem = { _id: new Types.ObjectId(itemId), stock: 4, threshold: 5, isLowStock: false, save: jest.fn() };
      (InventoryItemModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockItem);

      const items = [{ quantity: 1, ingredients: [{ inventoryItemId: itemId, quantity: 2 }] }];
      await InventoryService.deductStock(restaurantId, items);

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(NotificationsService.createNotification).toHaveBeenCalled();
    });

    it('restoreStock increases stock', async () => {
      const mockSession = { startTransaction: jest.fn(), commitTransaction: jest.fn(), abortTransaction: jest.fn(), endSession: jest.fn() };
      (mongoose.startSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const itemId = new Types.ObjectId().toString();
      const mockItem = { _id: new Types.ObjectId(itemId), stock: 10, threshold: 5, isLowStock: true, save: jest.fn() };
      (InventoryItemModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockItem);

      const items = [{ quantity: 1, ingredients: [{ inventoryItemId: itemId, quantity: 2 }] }];
      await InventoryService.restoreStock(restaurantId, items);

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockItem.isLowStock).toBe(false);
      expect(mockItem.save).toHaveBeenCalled();
    });
  });
});
