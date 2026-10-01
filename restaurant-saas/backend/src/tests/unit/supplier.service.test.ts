import { Types } from 'mongoose';
import { SupplierService } from '../../modules/suppliers/supplier.service';
import { SupplierModel } from '../../modules/suppliers/supplier.model';
import { logAuditRaw } from '../../modules/auditLogs/auditLogs.helper';
import { AppError } from '../../utils/AppError';

jest.mock('../../modules/suppliers/supplier.model');
jest.mock('../../modules/auditLogs/auditLogs.helper');

describe('SupplierService', () => {
  const restaurantId = new Types.ObjectId().toString();
  const actor = { id: 'user1', role: 'ADMIN' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSupplier', () => {
    it('throws error if supplier already exists', async () => {
      (SupplierModel.exists as jest.Mock).mockResolvedValueOnce(true);

      await expect(
        SupplierService.createSupplier(restaurantId, { name: 'Fresh Farms' }, actor)
      ).rejects.toThrow(AppError);
    });

    it('creates supplier and logs audit', async () => {
      (SupplierModel.exists as jest.Mock).mockResolvedValueOnce(false);
      const mockSupplier = { _id: new Types.ObjectId(), name: 'Fresh Farms' };
      (SupplierModel.create as jest.Mock).mockResolvedValueOnce(mockSupplier);

      const result = await SupplierService.createSupplier(restaurantId, { name: 'Fresh Farms' }, actor);

      expect(result).toBe(mockSupplier);
      expect(logAuditRaw).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_SUPPLIER_CREATED' })
      );
    });
  });

  describe('updateSupplier', () => {
    const supplierId = new Types.ObjectId().toString();

    it('throws error if supplier not found', async () => {
      (SupplierModel.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        SupplierService.updateSupplier(restaurantId, supplierId, { phone: '123' }, actor)
      ).rejects.toThrow(AppError);
    });

    it('updates supplier and logs audit', async () => {
      const mockSupplier = {
        _id: supplierId,
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({ _id: supplierId, phone: '123' }),
      };
      (SupplierModel.findOne as jest.Mock).mockResolvedValueOnce(mockSupplier);

      await SupplierService.updateSupplier(restaurantId, supplierId, { phone: '123' }, actor);

      expect(mockSupplier.save).toHaveBeenCalled();
      expect(logAuditRaw).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_SUPPLIER_UPDATED' })
      );
    });
  });

  describe('deleteSupplier', () => {
    const supplierId = new Types.ObjectId().toString();

    it('soft deletes supplier and logs audit', async () => {
      const mockSupplier = { _id: supplierId };
      (SupplierModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockSupplier);

      await SupplierService.deleteSupplier(restaurantId, supplierId, actor);

      expect(SupplierModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: supplierId, restaurantId, deletedAt: { $exists: false } },
        { active: false, deletedAt: expect.any(Date) },
        { new: true }
      );
      expect(logAuditRaw).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_SUPPLIER_DELETED' })
      );
    });
  });
});
