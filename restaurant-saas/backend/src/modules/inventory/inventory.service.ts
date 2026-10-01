import logger from '../../config/logger';
import { InventoryItemModel } from './inventory.model';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import mongoose, { Types } from 'mongoose';
import { logAuditRaw } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '../../constants/roles';
import { NotificationCategory, NotificationPriority } from '../notifications/notifications.schema';
import { InventoryTransactionService } from './inventoryTransaction.service';
import { InventoryTransactionModel, TransactionAction, TransactionSource } from './inventoryTransaction.model';
import { sendLowStockAlertEmail } from '../../services/mail.service';
import { RestaurantModel } from '../restaurants/restaurants.model';
import { UserModel } from '../users/users.model';
import { assertPlanLimit, recordSubscriptionUsage } from '../subscriptions/subscriptionEnforcement.service';

export class InventoryService {
  static async createInventoryItem(restaurantId: string, data: any, actor: { id: string; role: string }) {
    const currentItems = await InventoryItemModel.countDocuments({ restaurantId, active: { $ne: false } });
    await assertPlanLimit(restaurantId, 'inventoryLimit', currentItems + 1, 'inventory items');

    const existing = await InventoryItemModel.exists({
      restaurantId,
      name: data.name,
    });

    if (existing) {
      throw new AppError('Inventory item already exists', 409, ErrorCode.CONFLICT);
    }

    const item = await InventoryItemModel.create({
      restaurantId,
      name: data.name,
      stock: data.stock,
      unit: data.unit,
      threshold: data.threshold,
      isLowStock: Number(data.stock) <= Number(data.threshold),
      active: data.active ?? true,
      category: data.category,
      pricePerUnit: data.pricePerUnit,
      supplierId: data.supplierId,
      imageEmoji: data.imageEmoji,
      description: data.description,
    });

    await recordSubscriptionUsage(restaurantId, 'inventoryCount', currentItems + 1);

    await InventoryTransactionService.recordTransaction({
      restaurantId,
      inventoryItemId: item._id as any,
      action: TransactionAction.CREATE,
      quantity: item.stock,
      previousStock: 0,
      newStock: item.stock,
      source: TransactionSource.SYSTEM, // Assume SYSTEM initially, or ADMIN if passed
      performedBy: actor.id,
    });

    void logAuditRaw({
      entityType: AuditEntity.INVENTORY_ITEM,
      entityId: item._id.toString(),
      action: AuditAction.ADMIN_INVENTORY_CREATED,
      restaurantId,
      actorId: actor.id,
      actorRole: actor.role,
      metadata: { name: item.name, stock: item.stock },
    });

    return item;
  }

  static async bulkImportInventory(restaurantId: string | Types.ObjectId, items: any[], actor: { id: string; role: string }) {
    const existingItems = await InventoryItemModel.find({ restaurantId }).select('name').lean();
    const existingNames = new Set(existingItems.map(i => i.name.toLowerCase()));

    const duplicates: string[] = [];
    const toInsert: any[] = [];

    items.forEach(item => {
      if (existingNames.has(item.name.toLowerCase())) {
        duplicates.push(item.name);
      } else {
        toInsert.push({
          restaurantId,
          name: item.name,
          stock: item.stock,
          unit: item.unit,
          threshold: item.threshold,
          isLowStock: Number(item.stock) <= Number(item.threshold),
          active: item.active ?? true,
          category: item.category,
          pricePerUnit: item.pricePerUnit,
          supplierId: item.supplierId,
          imageEmoji: item.imageEmoji,
          description: item.description,
        });
        existingNames.add(item.name.toLowerCase()); // prevent duplicates within the payload
      }
    });

    await assertPlanLimit(
      restaurantId,
      'inventoryLimit',
      existingItems.length + toInsert.length,
      'inventory items',
    );

    let importedCount = 0;

    if (toInsert.length > 0) {
      const insertedDocs = await InventoryItemModel.insertMany(toInsert);
      importedCount = insertedDocs.length;
      await recordSubscriptionUsage(restaurantId, 'inventoryCount', existingItems.length + importedCount);

      const transactions = insertedDocs.map(doc => ({
        restaurantId,
        inventoryItemId: doc._id as any,
        action: TransactionAction.BULK_IMPORT,
        quantity: doc.stock,
        previousStock: 0,
        newStock: doc.stock,
        performedBy: actor?.id,
        source: TransactionSource.BULK_IMPORT,
      }));

      await InventoryTransactionService.recordBulkTransactions(transactions as any);

      void logAuditRaw({
        entityType: AuditEntity.INVENTORY_ITEM,
        entityId: 'bulk',
        action: AuditAction.ADMIN_INVENTORY_BULK_IMPORTED,
        restaurantId: restaurantId.toString(),
        actorId: actor?.id || 'system',
        actorRole: actor?.role || 'system',
        metadata: { imported: importedCount, skipped: duplicates.length },
      });
    }

    return {
      imported: importedCount,
      skipped: duplicates.length,
      duplicates,
    };
  }

  static async listInventoryItems(restaurantId: string, search: string, active?: boolean) {
    const filter: Record<string, unknown> = {
      restaurantId,
      active: true, // Only list active items by default
    };

    if (active !== undefined) {
      filter.active = active;
    }

    // Exclude soft-deleted items unless explicitly queried
    filter.deletedAt = { $exists: false };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    return InventoryItemModel.find(filter)
      .populate('supplierId', 'name contactPerson phone email')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getInventoryItemById(restaurantId: string, itemId: string) {
    const item = await InventoryItemModel.findOne({
      _id: itemId,
      restaurantId,
      deletedAt: { $exists: false }
    }).populate('supplierId', 'name contactPerson phone email').lean();

    if (!item) {
      throw new AppError('Inventory item not found', 404, ErrorCode.NOT_FOUND);
    }
    return item;
  }

  static async updateInventoryItem(restaurantId: string, itemId: string, data: any, actor: { id: string; role: string }) {
    if (data.name) {
      const existing = await InventoryItemModel.exists({
        _id: { $ne: itemId },
        restaurantId,
        name: data.name,
      });

      if (existing) {
        throw new AppError('Inventory item already exists', 409, ErrorCode.CONFLICT);
      }
    }

    const item = await InventoryItemModel.findOne({
      _id: itemId,
      restaurantId,
    });

    if (!item) {
      throw new AppError('Inventory item not found', 404, ErrorCode.NOT_FOUND);
    }

    const previousStock = item.stock;

    if (data.name !== undefined) item.name = data.name;
    if (data.stock !== undefined) {
      if (data.stock < 0) {
        throw new AppError('Stock cannot be negative', 400, ErrorCode.VALIDATION_ERROR);
      }
      item.stock = data.stock;
    }
    if (data.unit !== undefined) item.unit = data.unit;
    if (data.threshold !== undefined) item.threshold = data.threshold;
    if (data.active !== undefined) item.active = data.active;
    if (data.category !== undefined) item.category = data.category;
    if (data.pricePerUnit !== undefined) item.pricePerUnit = data.pricePerUnit;
    if (data.supplierId !== undefined) item.supplierId = data.supplierId;
    if (data.imageEmoji !== undefined) item.imageEmoji = data.imageEmoji;
    if (data.description !== undefined) item.description = data.description;

    const wasLowStock = item.isLowStock;
    item.isLowStock = item.stock <= item.threshold;

    await item.save();

    // Trigger email if it just became low stock
    if (!wasLowStock && item.isLowStock) {
      (async () => {
        try {
          const restaurant = await RestaurantModel.findById(restaurantId).lean();
          if (!restaurant) return;
          const admins = await UserModel.find({ restaurantId, role: UserRole.RESTAURANT_ADMIN }).lean();
          for (const admin of admins) {
            await sendLowStockAlertEmail(
              admin.email,
              restaurant.name,
              item.name,
              item.stock,
              item.threshold,
              item.unit
            );
          }
        } catch (err) {
          logger.error('Failed to trigger low stock email', { error: err });
        }
      })();
    }

    if (data.stock !== undefined && previousStock !== data.stock) {
      await InventoryTransactionService.recordTransaction({
        restaurantId,
        inventoryItemId: item._id as any,
        action: TransactionAction.MANUAL_ADJUSTMENT,
        quantity: Math.abs(item.stock - previousStock),
        previousStock,
        newStock: item.stock,
        performedBy: actor.id,
        source: TransactionSource.ADMIN,
      });
    }

    void logAuditRaw({
      entityType: AuditEntity.INVENTORY_ITEM,
      entityId: itemId,
      action: AuditAction.ADMIN_INVENTORY_UPDATED,
      restaurantId,
      actorId: actor.id,
      actorRole: actor.role,
      metadata: { updatedFields: Object.keys(data) },
    });

    return item.toObject();
  }

  static async getInventoryAlerts(restaurantId: string) {
    return InventoryItemModel.find({
      restaurantId,
      active: true,
      isLowStock: true,
      deletedAt: { $exists: false },
    })
      .sort({ stock: 1, threshold: 1, updatedAt: -1 })
      .lean();
  }

  static async deleteInventoryItem(restaurantId: string, itemId: string, actor: { id: string; role: string }) {
    const item = await InventoryItemModel.findOneAndUpdate(
      { _id: itemId, restaurantId },
      { active: false, deletedAt: new Date(), isLowStock: false },
      { new: true },
    );

    if (!item) {
      throw new AppError('Inventory item not found', 404, ErrorCode.NOT_FOUND);
    }

    void logAuditRaw({
      entityType: AuditEntity.INVENTORY_ITEM,
      entityId: itemId,
      action: AuditAction.ADMIN_INVENTORY_DELETED,
      restaurantId,
      actorId: actor.id,
      actorRole: actor.role,
      metadata: { deletedAt: new Date().toISOString() },
    });

    return item;
  }

  static async getInventoryStats(restaurantId: string) {
    const pipeline: any[] = [
      {
        $match: {
          restaurantId: new Types.ObjectId(restaurantId),
          deletedAt: { $exists: false },
        },
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalItems: { $sum: 1 },
                activeItems: {
                  $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] },
                },
                lowStockItems: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ['$active', true] }, { $eq: ['$isLowStock', true] }] },
                      1,
                      0,
                    ],
                  },
                },
                outOfStockItems: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ['$active', true] }, { $eq: ['$stock', 0] }] },
                      1,
                      0,
                    ],
                  },
                },
                totalInventoryValue: {
                  $sum: {
                    $cond: [
                      { $eq: ['$active', true] },
                      { $multiply: ['$stock', { $ifNull: ['$pricePerUnit', 0] }] },
                      0,
                    ],
                  },
                },
                averageStock: {
                  $avg: {
                    $cond: [{ $eq: ['$active', true] }, '$stock', null],
                  },
                },
                healthyItems: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$active', true] },
                          { $eq: ['$isLowStock', false] },
                          { $gt: ['$stock', 0] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          categoryDistribution: [
            { $match: { active: true } },
            {
              $group: {
                _id: { $ifNull: ['$category', 'Uncategorized'] },
                count: { $sum: 1 },
                value: { $sum: { $multiply: ['$stock', { $ifNull: ['$pricePerUnit', 0] }] } },
              },
            },
            { $sort: { value: -1 } }
          ],
          supplierDistribution: [
            { $match: { active: true, supplierId: { $ne: null } } },
            { $group: { _id: '$supplierId', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
        },
      },
    ];

    const result = await InventoryItemModel.aggregate(pipeline);
    const facetData = result[0];

    const stats = (facetData.overview && facetData.overview[0]) || {
      totalItems: 0,
      activeItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalInventoryValue: 0,
      averageStock: 0,
      healthyItems: 0,
    };

    return {
      totalItems: stats.totalItems,
      activeItems: stats.activeItems,
      lowStockItems: stats.lowStockItems,
      outOfStockItems: stats.outOfStockItems,
      totalInventoryValue: stats.totalInventoryValue,
      averageStock: Math.round(stats.averageStock || 0),
      stockHealth: {
        healthy: stats.healthyItems,
        low: stats.lowStockItems - stats.outOfStockItems,
        outOfStock: stats.outOfStockItems,
      },
      categoryDistribution: facetData.categoryDistribution || [],
      supplierDistribution: facetData.supplierDistribution || [],
    };
  }

  static async deductStock(restaurantId: string | Types.ObjectId, items: any[], referenceOrderId?: string | Types.ObjectId, performedBy?: string | Types.ObjectId) {
    logger.info(`📦 Inventory Hook: Deducting stock for ${items.length} items`);

    const ingredientMap = new Map<string, number>();

    items.forEach(item => {
      if (item.ingredients && Array.isArray(item.ingredients)) {
        item.ingredients.forEach((ing: any) => {
          const key = ing.inventoryItemId.toString();
          const totalQty = ing.quantity * item.quantity;
          ingredientMap.set(key, (ingredientMap.get(key) || 0) + totalQty);
        });
      }
    });

    if (ingredientMap.size === 0) {
      return true;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transactions = [];
      const lowStockAlerts = [];

      for (const [id, deductAmt] of ingredientMap.entries()) {
        const item = await InventoryItemModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(id),
            restaurantId: new Types.ObjectId(restaurantId),
            stock: { $gte: deductAmt }
          },
          { $inc: { stock: -deductAmt } },
          { new: true, session }
        );

        if (!item) {
          throw new AppError(`Insufficient stock or item not found for ID: ${id}`, 400, ErrorCode.VALIDATION_ERROR);
        }

        transactions.push({
          restaurantId,
          inventoryItemId: item._id as any,
          action: TransactionAction.DEDUCT,
          quantity: deductAmt,
          previousStock: item.stock + deductAmt,
          newStock: item.stock,
          performedBy,
          source: TransactionSource.KITCHEN,
          referenceOrderId,
        });

        if ((item.stock + deductAmt) > item.threshold && item.stock <= item.threshold) {
          lowStockAlerts.push(item);
        }

        if (item.stock <= item.threshold && !item.isLowStock) {
          item.isLowStock = true;
          await item.save({ session });
        }
      }

      await InventoryTransactionModel.insertMany(transactions, { session });

      await session.commitTransaction();
      session.endSession();

      for (const item of lowStockAlerts) {
        NotificationsService.createNotification({
          restaurantId: new Types.ObjectId(restaurantId),
          recipientRole: UserRole.RESTAURANT_ADMIN,
          title: 'Low Stock Alert',
          message: `${item.name} has fallen below the threshold level. Current stock: ${item.stock} ${item.unit}.`,
          type: 'LOW_STOCK_ALERT',
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.HIGH,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }).catch(err => {
          logger.error(`Failed to generate low stock alert for ${item.name}: ${err.message}`);
        });

        // Trigger email alert
        (async () => {
          try {
            const restaurant = await RestaurantModel.findById(restaurantId).lean();
            if (!restaurant) return;
            const admins = await UserModel.find({ restaurantId, role: UserRole.RESTAURANT_ADMIN }).lean();
            for (const admin of admins) {
              await sendLowStockAlertEmail(
                admin.email,
                restaurant.name,
                item.name,
                item.stock,
                item.threshold,
                item.unit
              );
            }
          } catch (err) {
            logger.error('Failed to trigger low stock email in deductStock', { error: err });
          }
        })();
      }

      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async restoreStock(restaurantId: string | Types.ObjectId, items: any[], referenceOrderId?: string | Types.ObjectId, performedBy?: string | Types.ObjectId) {
    logger.info(`📦 Inventory Hook: Restoring stock for ${items.length} items`);

    const ingredientMap = new Map<string, number>();

    items.forEach(item => {
      if (item.ingredients && Array.isArray(item.ingredients)) {
        item.ingredients.forEach((ing: any) => {
          const key = ing.inventoryItemId.toString();
          const totalQty = ing.quantity * item.quantity;
          ingredientMap.set(key, (ingredientMap.get(key) || 0) + totalQty);
        });
      }
    });

    if (ingredientMap.size === 0) {
      return true;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transactions = [];

      for (const [id, restoreAmt] of ingredientMap.entries()) {
        const item = await InventoryItemModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(id),
            restaurantId: new Types.ObjectId(restaurantId)
          },
          { $inc: { stock: restoreAmt } },
          { new: true, session }
        );

        if (!item) {
          throw new AppError(`Item not found for ID: ${id}`, 404, ErrorCode.NOT_FOUND);
        }

        transactions.push({
          restaurantId,
          inventoryItemId: item._id as any,
          action: TransactionAction.RESTORE,
          quantity: restoreAmt,
          previousStock: item.stock - restoreAmt,
          newStock: item.stock,
          performedBy,
          source: TransactionSource.KITCHEN,
          referenceOrderId,
        });

        if (item.stock > item.threshold && item.isLowStock) {
          item.isLowStock = false;
          await item.save({ session });
        }
      }

      await InventoryTransactionModel.insertMany(transactions, { session });

      await session.commitTransaction();
      session.endSession();

      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
