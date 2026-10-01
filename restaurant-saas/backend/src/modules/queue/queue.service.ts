import mongoose from 'mongoose';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { QueueEntryModel } from './queue.model';
import { TableModel } from '../tables/tables.model';
import { TableSessionModel } from '../tableSessions/tableSessions.model';
import { CustomerProfileModel } from '../analytics/customerProfile.model';
import { QueueStatus, SessionStatus, TableStatus, Priority } from '../../constants/statuses';
import { generateSecureToken } from '../../utils/crypto';
import { assertFeatureAccess, assertPlanLimit, recordSubscriptionUsage } from '../subscriptions/subscriptionEnforcement.service';

export class QueueService {
  static async joinQueue(data: {
    restaurantId: string;
    customerName: string;
    mobile: string;
    guests: number;
    priority?: Priority;
    etaMinutes?: number;
    notes?: string;
  }) {
    await assertFeatureAccess(data.restaurantId, 'queueAccess', 'Queue management');

    const currentQueueUsage = await QueueEntryModel.countDocuments({ restaurantId: data.restaurantId });
    await assertPlanLimit(data.restaurantId, 'queueLimit', currentQueueUsage + 1, 'Queue');

    const customer = await CustomerProfileModel.findOneAndUpdate(
      { mobile: data.mobile },
      {
        $set: { name: data.customerName },
        $addToSet: { restaurantsVisited: data.restaurantId },
        $setOnInsert: { totalVisits: 0, totalSpent: 0 },
      },
      { upsert: true, new: true }
    );

    const queueEntry = await QueueEntryModel.create({
      restaurantId: data.restaurantId,
      customerProfileId: customer._id,
      customerName: data.customerName,
      mobile: data.mobile,
      guests: data.guests,
      priority: data.priority || Priority.NORMAL,
      etaMinutes: data.etaMinutes || 15,
      notes: data.notes || '',
      status: QueueStatus.WAITING,
    });

    const queueUsage = await QueueEntryModel.countDocuments({ restaurantId: data.restaurantId });
    await recordSubscriptionUsage(data.restaurantId, 'queueUsage', queueUsage);

    return queueEntry;
  }

  static async listQueue(restaurantId: string, filters: { status?: QueueStatus }) {
    const query: any = { restaurantId };
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = QueueStatus.WAITING; // Default to active waitlist
    }

    const entries = await QueueEntryModel.find(query)
      .sort({ priority: -1, createdAt: 1 }) // Highest priority first, then FIFO
      .lean();

    return entries;
  }

  static async getQueueEntryById(restaurantId: string, id: string) {
    const entry = await QueueEntryModel.findOne({ _id: id, restaurantId })
      .populate('tableId', 'tableNumber status')
      .lean();

    if (!entry) {
      throw new AppError('Queue entry not found', 404, ErrorCode.NOT_FOUND);
    }
    return entry;
  }

  static async updatePriority(restaurantId: string, id: string, priority: Priority) {
    const entry = await QueueEntryModel.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: { priority } },
      { new: true }
    ).lean();

    if (!entry) {
      throw new AppError('Queue entry not found', 404, ErrorCode.NOT_FOUND);
    }
    return entry;
  }

  static async cancelQueue(restaurantId: string, id: string) {
    const entry = await QueueEntryModel.findOneAndUpdate(
      { _id: id, restaurantId, status: QueueStatus.WAITING },
      { $set: { status: QueueStatus.CANCELLED } },
      { new: true }
    ).lean();

    if (!entry) {
      throw new AppError('Queue entry not found or already processed', 404, ErrorCode.NOT_FOUND);
    }
    return entry;
  }

  static async seatWalkIn(restaurantId: string, id: string, tableId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const queueEntry = await QueueEntryModel.findOne({ _id: id, restaurantId }).session(session);
      if (!queueEntry) {
        throw new AppError('Queue entry not found', 404, ErrorCode.NOT_FOUND);
      }

      if (queueEntry.status !== QueueStatus.WAITING) {
        throw new AppError('Only waiting entries can be seated', 400, ErrorCode.VALIDATION_ERROR);
      }

      const table = await TableModel.findOne({ _id: tableId, restaurantId }).session(session);
      if (!table) {
        throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
      }

      if (table.status !== TableStatus.AVAILABLE) {
        throw new AppError('Table is not available for seating', 400, ErrorCode.VALIDATION_ERROR);
      }

      // 1. Update Table
      table.status = TableStatus.OCCUPIED;
      await table.save({ session });

      // 2. Create TableSession
      const sessionToken = await generateSecureToken();
      const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

      const tableSession = await TableSessionModel.create(
        [
          {
            restaurantId,
            tableId: table._id,
            customerName: queueEntry.customerName,
            mobile: queueEntry.mobile,
            sessionToken,
            sessionStart: new Date(),
            expiresAt,
            queueId: queueEntry._id,
            customerProfileId: queueEntry.customerProfileId,
            status: SessionStatus.ACTIVE,
          },
        ],
        { session }
      );

      table.currentSessionId = tableSession[0]._id;
      await table.save({ session });

      // 3. Update Queue Entry
      queueEntry.status = QueueStatus.SEATED;
      queueEntry.tableId = table._id;
      await queueEntry.save({ session });

      // 4. Update Customer Profile (increment visit)
      if (queueEntry.customerProfileId) {
        await CustomerProfileModel.updateOne(
          { _id: queueEntry.customerProfileId },
          {
            $inc: { totalVisits: 1 },
            $set: { lastVisitAt: new Date() },
          },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return await this.getQueueEntryById(restaurantId, id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
