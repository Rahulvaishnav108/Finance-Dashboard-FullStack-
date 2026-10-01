import { Types } from 'mongoose';
import {
  InventoryTransactionModel,
  TransactionAction,
  TransactionSource,
} from './inventoryTransaction.model';

export interface CreateTransactionInput {
  restaurantId: string | Types.ObjectId;
  inventoryItemId: string | Types.ObjectId;
  action: TransactionAction;
  quantity: number;
  previousStock: number;
  newStock: number;
  performedBy?: string | Types.ObjectId | null;
  source: TransactionSource;
  referenceOrderId?: string | Types.ObjectId;
}

export class InventoryTransactionService {
  /**
   * Logs a single stock transaction
   */
  static async recordTransaction(input: CreateTransactionInput) {
    try {
      await InventoryTransactionModel.create(input);
    } catch (err) {
      // Intentionally not failing the entire workflow if logging fails,
      // but in an enterprise app, this should be caught properly or logged
      console.error('[InventoryTransactionService] Failed to record transaction:', err);
    }
  }

  /**
   * Logs multiple transactions at once (e.g. for bulk order deductions)
   */
  static async recordBulkTransactions(inputs: CreateTransactionInput[]) {
    if (!inputs.length) return;
    try {
      await InventoryTransactionModel.insertMany(inputs);
    } catch (err) {
      console.error('[InventoryTransactionService] Failed to record bulk transactions:', err);
    }
  }

  /**
   * Gets a history of transactions for a specific inventory item
   */
  static async getItemTransactions(restaurantId: string | Types.ObjectId, inventoryItemId: string | Types.ObjectId) {
    return InventoryTransactionModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      inventoryItemId: new Types.ObjectId(inventoryItemId),
    })
      .sort({ createdAt: -1 })
      .populate('performedBy', 'name email')
      .populate('referenceOrderId', 'orderNumber');
  }
}
