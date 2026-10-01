import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { logAuditRaw } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import { SupplierModel } from './supplier.model';

export class SupplierService {
  static async createSupplier(restaurantId: string, data: any, actor: { id: string; role: string }) {
    const existing = await SupplierModel.exists({
      restaurantId,
      name: data.name,
      deletedAt: { $exists: false },
    });

    if (existing) {
      throw new AppError('Supplier with this name already exists', 409, ErrorCode.CONFLICT);
    }

    const supplier = await SupplierModel.create({
      restaurantId,
      name: data.name,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      active: data.active ?? true,
    });

    void logAuditRaw({
      entityType: AuditEntity.SUPPLIER,
      entityId: supplier._id.toString(),
      action: AuditAction.ADMIN_SUPPLIER_CREATED,
      restaurantId,
      actorId: actor.id,
      actorRole: actor.role,
      metadata: { name: supplier.name },
    });

    return supplier;
  }

  static async listSuppliers(restaurantId: string, search: string, active?: boolean) {
    const filter: Record<string, unknown> = {
      restaurantId,
      deletedAt: { $exists: false },
    };

    if (active !== undefined) {
      filter.active = active;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    return SupplierModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  static async updateSupplier(restaurantId: string, supplierId: string, data: any, actor: { id: string; role: string }) {
    if (data.name) {
      const existing = await SupplierModel.exists({
        _id: { $ne: supplierId },
        restaurantId,
        name: data.name,
        deletedAt: { $exists: false },
      });

      if (existing) {
        throw new AppError('Supplier with this name already exists', 409, ErrorCode.CONFLICT);
      }
    }

    const supplier = await SupplierModel.findOne({
      _id: supplierId,
      restaurantId,
      deletedAt: { $exists: false },
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404, ErrorCode.NOT_FOUND);
    }

    if (data.name !== undefined) supplier.name = data.name;
    if (data.contactPerson !== undefined) supplier.contactPerson = data.contactPerson;
    if (data.phone !== undefined) supplier.phone = data.phone;
    if (data.email !== undefined) supplier.email = data.email;
    if (data.address !== undefined) supplier.address = data.address;
    if (data.active !== undefined) supplier.active = data.active;

    await supplier.save();

    void logAuditRaw({
      entityType: AuditEntity.SUPPLIER,
      entityId: supplier._id.toString(),
      action: AuditAction.ADMIN_SUPPLIER_UPDATED,
      restaurantId,
      actorId: actor.id,
      actorRole: actor.role,
      metadata: { updatedFields: Object.keys(data) },
    });

    return supplier.toObject();
  }

  static async deleteSupplier(restaurantId: string, supplierId: string, actor: { id: string; role: string }) {
    const supplier = await SupplierModel.findOneAndUpdate(
      { _id: supplierId, restaurantId, deletedAt: { $exists: false } },
      { active: false, deletedAt: new Date() },
      { new: true }
    );

    if (!supplier) {
      throw new AppError('Supplier not found', 404, ErrorCode.NOT_FOUND);
    }

    void logAuditRaw({
      entityType: AuditEntity.SUPPLIER,
      entityId: supplierId,
      action: AuditAction.ADMIN_SUPPLIER_DELETED,
      restaurantId,
      actorId: actor.id,
      actorRole: actor.role,
      metadata: { deletedAt: new Date().toISOString() },
    });

    return supplier;
  }
}
