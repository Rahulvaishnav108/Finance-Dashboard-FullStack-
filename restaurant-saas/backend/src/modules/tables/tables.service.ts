// src/modules/tables/tables.service.ts
// Table business logic — CRUD + lifecycle transition validation

import { TableModel, ITable, TABLE_TRANSITIONS } from './tables.model';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { TableStatus } from '../../constants/statuses';
import { emitSessionEvent } from '../../services/sessionEvents';
import { SocketEvent } from '../../constants/events';
import { CreateTableInput, UpdateTableInput } from './tables.schema';
import crypto from 'crypto';
import { ensureCleaningTaskForTable } from '../cleaning/cleaning.service';
import { assertPlanLimit, recordSubscriptionUsage } from '../subscriptions/subscriptionEnforcement.service';

/**
 * Create a new table for a restaurant.
 */
export async function createTable(input: CreateTableInput & { qrToken?: string }): Promise<ITable> {
  if (!input.restaurantId) {
    throw new AppError('Restaurant context required', 400, ErrorCode.VALIDATION_ERROR);
  }

  const currentTables = await TableModel.countDocuments({ restaurantId: input.restaurantId, isActive: true });
  await assertPlanLimit(input.restaurantId, 'tableLimit', currentTables + 1, 'tables');

  // Auto-generate qrCode if not provided
  const qrCode = input.qrCode || `${input.restaurantId}-${input.tableNumber}-${crypto.randomBytes(4).toString('hex')}`;
  const qrToken = input.qrToken || crypto.randomBytes(16).toString('hex');
  const now = new Date();

  const table = await TableModel.create({
    ...input,
    qrCode,
    qrToken,
    qrGeneratedAt: now,
    qrLastRegeneratedAt: now,
    floor: input.floor ?? 1,
    section: input.section ?? 'Main',
    assignedStaffId: input.assignedStaffId ?? null,
    status: TableStatus.AVAILABLE,
    isActive: true,
  });

  await recordSubscriptionUsage(input.restaurantId, 'activeTables', currentTables + 1);

  return table;
}

/**
 * Update table properties (not status — use updateTableStatus for that).
 */
export async function updateTable(
  tableId: string,
  input: UpdateTableInput,
  restaurantId: string
): Promise<ITable> {
  const table = await TableModel.findOneAndUpdate(
    { _id: tableId, restaurantId },
    input,
    {
    new: true,
    runValidators: true,
    }
  );

  if (!table) {
    throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
  }

  return table;
}

/**
 * Get all tables for a restaurant.
 */
export async function getTablesByRestaurant(restaurantId: string): Promise<ITable[]> {
  return TableModel.find({ restaurantId }).sort({ tableNumber: 1 });
}

/**
 * Get a single table by ID.
 */
export async function getTableById(tableId: string, restaurantId: string): Promise<ITable> {
  const table = await TableModel.findOne({ _id: tableId, restaurantId });
  if (!table) {
    throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
  }
  return table;
}

/**
 * Find a table by its QR code identifier.
 */
export async function findByQrCode(qrCode: string): Promise<ITable> {
  const table = await TableModel.findOne({ qrCode, isActive: true });
  if (!table) {
    throw new AppError('Table not found or inactive', 404, ErrorCode.NOT_FOUND);
  }
  return table;
}

/**
 * Find a table by its secure QR token.
 */
export async function findByQrToken(qrToken: string): Promise<ITable> {
  const table = await TableModel.findOne({ qrToken, isActive: true });
  if (!table) {
    throw new AppError('Table not found or inactive', 404, ErrorCode.NOT_FOUND);
  }
  return table;
}

/**
 * Update table status with lifecycle transition validation.
 * Emits Socket.IO events for real-time updates.
 */
export async function updateTableStatus(
  tableId: string,
  newStatus: TableStatus,
  restaurantId: string
): Promise<ITable> {
  const table = await TableModel.findOne({ _id: tableId, restaurantId });
  if (!table) {
    throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
  }

  if (!table.isActive) {
    throw new AppError('Table is inactive', 400, ErrorCode.TABLE_INACTIVE);
  }

  // Validate transition
  const currentStatus = table.status as TableStatus;
  const allowed = TABLE_TRANSITIONS[currentStatus];

  console.error(`[DEBUG] updateTableStatus: tableId=${tableId}, currentStatus=${currentStatus}, newStatus=${newStatus}, allowed=[${allowed?.join(',')}]`);

  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Invalid transition from ${currentStatus} to ${newStatus}`,
      400,
      ErrorCode.TABLE_INVALID_TRANSITION
    );
  }

  table.status = newStatus;

  if (newStatus === TableStatus.NEEDS_CLEANING) {
    await ensureCleaningTaskForTable({
      restaurantId: table.restaurantId,
      tableId: table._id,
      sessionId: table.currentSessionId ?? null,
    });
  }

  // Clear session reference when table becomes available
  if (newStatus === TableStatus.AVAILABLE) {
    table.currentSessionId = undefined;
  }

  await table.save();

  // Emit granular lifecycle event
  const eventMap: Record<string, string> = {
    [TableStatus.OCCUPIED]: SocketEvent.TABLE_OCCUPIED,
    [TableStatus.BILL_PENDING]: SocketEvent.TABLE_PAYMENT_PENDING,
    [TableStatus.PAYMENT_PENDING]: SocketEvent.TABLE_PAYMENT_PENDING,
    [TableStatus.NEEDS_CLEANING]: SocketEvent.TABLE_NEEDS_CLEANING,
    [TableStatus.CLEANING_IN_PROGRESS]: SocketEvent.TABLE_CLEANING_STARTED,
    [TableStatus.AVAILABLE]: SocketEvent.TABLE_AVAILABLE,
  };

  const event = eventMap[newStatus];
  if (event) {
    emitSessionEvent(table.restaurantId.toString(), event, {
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: newStatus,
    });
  }

  // Also emit the generic status-updated event
  emitSessionEvent(table.restaurantId.toString(), SocketEvent.TABLE_STATUS_UPDATED, {
    tableId: table._id,
    tableNumber: table.tableNumber,
    status: newStatus,
  });

  return table;
}
