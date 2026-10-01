import mongoose from 'mongoose';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ReservationModel } from './reservations.model';
import { TableModel } from '../tables/tables.model';
import { TableSessionModel } from '../tableSessions/tableSessions.model';
import { CustomerProfileModel } from '../analytics/customerProfile.model';
import { ReservationStatus, SessionStatus, TableStatus } from '../../constants/statuses';
import { generateSecureToken } from '../../utils/crypto';
import { RestaurantModel } from '../restaurants/restaurants.model';
import logger from '../../config/logger';
import { MessagingService } from '../../services/messaging.service';
import { NotificationPreference } from './reservations.model';
import { assertFeatureAccess, assertPlanLimit, recordSubscriptionUsage } from '../subscriptions/subscriptionEnforcement.service';

export class ReservationsService {
  static async createReservation(data: {
    restaurantId: string;
    customerName: string;
    customerEmail?: string;
    mobile: string;
    guests: number;
    date: string;
    slot: string;
    notes?: string;
    status?: ReservationStatus;
    notificationPreference?: NotificationPreference;
  }) {
    await assertFeatureAccess(data.restaurantId, 'reservationAccess', 'Reservations');

    const currentActivity = await ReservationModel.countDocuments({ restaurantId: data.restaurantId });
    await assertPlanLimit(data.restaurantId, 'reservationLimit', currentActivity + 1, 'Reservations');

    // Upsert Customer Profile
    const customer = await CustomerProfileModel.findOneAndUpdate(
      { mobile: data.mobile },
      {
        $set: { name: data.customerName },
        $addToSet: { restaurantsVisited: data.restaurantId },
        $setOnInsert: { totalVisits: 0, totalSpent: 0 },
      },
      { upsert: true, new: true }
    );

    const reservation = await ReservationModel.create({
      restaurantId: data.restaurantId,
      customerProfileId: customer._id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      mobile: data.mobile,
      guests: data.guests,
      date: data.date,
      slot: data.slot,
      notes: data.notes,
      status: data.status || ReservationStatus.PENDING,
      notificationPreference: data.notificationPreference || NotificationPreference.NONE,
    });

    const reservationActivity = await ReservationModel.countDocuments({ restaurantId: data.restaurantId });
    await recordSubscriptionUsage(data.restaurantId, 'reservationActivity', reservationActivity);

    if (reservation.status === ReservationStatus.CONFIRMED) {
      this.triggerNotifications(reservation).catch(e => logger.error('Async notification error', e));
    }

    return reservation;
  }

  private static async triggerNotifications(reservation: any) {
    try {
      const restaurant = await RestaurantModel.findById(reservation.restaurantId).lean();
      if (!restaurant) return;

      let templateName = '';
      if (reservation.status === ReservationStatus.CONFIRMED) {
        templateName = 'reservation-confirmed';
      } else if (reservation.status === ReservationStatus.CANCELLED) {
        templateName = 'reservation-cancelled';
      } else {
        return;
      }

      const data = {
        customerName: reservation.customerName,
        restaurantName: restaurant.name,
        date: reservation.date,
        time: reservation.slot,
        guestCount: String(reservation.guests)
      };

      let success = false;

      if (reservation.notificationPreference === NotificationPreference.SMS) {
        success = await MessagingService.sendSMS(reservation.mobile, templateName, data);
      } else if (reservation.notificationPreference === NotificationPreference.WHATSAPP) {
        success = await MessagingService.sendWhatsApp(reservation.mobile, templateName, data);
      }

      if (success) {
        await ReservationModel.updateOne({ _id: reservation._id }, {
          notificationSentAt: new Date(),
          lastNotificationType: reservation.status,
          notificationFailureReason: null
        });
      } else if (reservation.notificationPreference !== NotificationPreference.NONE) {
        await ReservationModel.updateOne({ _id: reservation._id }, {
          notificationFailureReason: 'Provider failed to send'
        });
      }
    } catch (error: any) {
      logger.error('Failed to trigger notifications', { error });
      await ReservationModel.updateOne({ _id: reservation._id }, {
        notificationFailureReason: error.message
      });
    }
  }

  static async listReservations(
    restaurantId: string,
    filters: { date?: string; status?: ReservationStatus; q?: string }
  ) {
    const query: any = { restaurantId };

    if (filters.date) query.date = filters.date;
    if (filters.status) query.status = filters.status;
    if (filters.q) {
      query.$or = [
        { customerName: { $regex: filters.q, $options: 'i' } },
        { mobile: { $regex: filters.q, $options: 'i' } },
      ];
    }

    return ReservationModel.find(query)
      .sort({ date: 1, slot: 1 })
      .populate('tableId', 'tableNumber status capacity')
      .lean();
  }

  static async getReservationById(restaurantId: string, id: string) {
    const reservation = await ReservationModel.findOne({ _id: id, restaurantId })
      .populate('tableId', 'tableNumber status capacity')
      .lean();

    if (!reservation) {
      throw new AppError('Reservation not found', 404, ErrorCode.NOT_FOUND);
    }
    return reservation;
  }

  static async updateReservation(
    restaurantId: string,
    id: string,
    updates: Partial<{
      customerName: string;
      customerEmail: string;
      mobile: string;
      guests: number;
      date: string;
      slot: string;
      status: ReservationStatus;
      tableId: string | null;
      notes: string;
      notificationPreference: NotificationPreference;
    }>
  ) {
    const existing = await ReservationModel.findOne({ _id: id, restaurantId });
    if (!existing) {
      throw new AppError('Reservation not found', 404, ErrorCode.NOT_FOUND);
    }
    const previousStatus = existing.status;

    // If mobile or name is updated, we might need to sync customer profile,
    // but for simplicity we just update the reservation fields.
    const reservation = await ReservationModel.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!reservation) {
      throw new AppError('Reservation not found', 404, ErrorCode.NOT_FOUND);
    }

    if (
      (previousStatus !== ReservationStatus.CONFIRMED && reservation.status === ReservationStatus.CONFIRMED) ||
      (previousStatus !== ReservationStatus.CANCELLED && reservation.status === ReservationStatus.CANCELLED)
    ) {
      this.triggerNotifications(reservation).catch(e => logger.error('Async notification error', e));
    }

    return reservation;
  }

  static async checkInReservation(restaurantId: string, id: string, tableId?: string) {
    try {
      return await this.checkInReservationWithTransaction(restaurantId, id, tableId);
    } catch (error: any) {
      if (error?.message?.includes('Transaction numbers are only allowed') || error?.message?.includes('replica set')) {
        return await this.checkInReservationNoTransaction(restaurantId, id, tableId);
      }
      throw error;
    }
  }

  static async checkInReservationWithTransaction(restaurantId: string, id: string, tableId?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await ReservationModel.findOne({ _id: id, restaurantId }).session(session);
      if (!reservation) {
        throw new AppError('Reservation not found', 404, ErrorCode.NOT_FOUND);
      }

      if (
        reservation.status === ReservationStatus.CHECKED_IN ||
        reservation.status === ReservationStatus.CANCELLED ||
        reservation.status === ReservationStatus.COMPLETED
      ) {
        throw new AppError('Reservation cannot be checked in', 400, ErrorCode.VALIDATION_ERROR);
      }

      const resolvedTableId = tableId || reservation.tableId?.toString();
      if (!resolvedTableId) {
        throw new AppError('Table ID is required for check-in', 400, ErrorCode.VALIDATION_ERROR);
      }

      const table = await TableModel.findOne({ _id: resolvedTableId, restaurantId }).session(session);
      if (!table) {
        throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
      }

      if (table.status !== TableStatus.AVAILABLE && table.status !== TableStatus.RESERVED && table.status !== TableStatus.OCCUPIED) {
        throw new AppError('Table is not available for check-in', 400, ErrorCode.VALIDATION_ERROR);
      }

      // 1. Update Table
      table.status = TableStatus.OCCUPIED;
      await table.save({ session });

      // 2. Create TableSession
      const sessionToken = await generateSecureToken();
      // Set expiration to 4 hours from now
      const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

      const tableSession = await TableSessionModel.create(
        [
          {
            restaurantId,
            tableId: table._id,
            customerName: reservation.customerName,
            mobile: reservation.mobile || '0000000000',
            sessionToken,
            sessionStart: new Date(),
            expiresAt,
            reservationId: reservation._id,
            customerProfileId: reservation.customerProfileId,
            status: SessionStatus.ACTIVE,
          },
        ],
        { session }
      );

      table.currentSessionId = tableSession[0]._id;
      await table.save({ session });

      // 3. Update Reservation
      reservation.status = ReservationStatus.CHECKED_IN;
      reservation.tableId = table._id;
      if (!reservation.mobile) {
        reservation.mobile = '0000000000';
      }
      await reservation.save({ session });

      // 4. Update Customer Profile (increment visit)
      if (reservation.customerProfileId) {
        await CustomerProfileModel.updateOne(
          { _id: reservation.customerProfileId },
          {
            $inc: { totalVisits: 1 },
            $set: { lastVisitAt: new Date() },
          },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return await this.getReservationById(restaurantId, id);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async checkInReservationNoTransaction(restaurantId: string, id: string, tableId?: string) {
    const reservation = await ReservationModel.findOne({ _id: id, restaurantId });
    if (!reservation) {
      throw new AppError('Reservation not found', 404, ErrorCode.NOT_FOUND);
    }

    if (
      reservation.status === ReservationStatus.CHECKED_IN ||
      reservation.status === ReservationStatus.CANCELLED ||
      reservation.status === ReservationStatus.COMPLETED
    ) {
      throw new AppError('Reservation cannot be checked in', 400, ErrorCode.VALIDATION_ERROR);
    }

    const resolvedTableId = tableId || reservation.tableId?.toString();
    if (!resolvedTableId) {
      throw new AppError('Table ID is required for check-in', 400, ErrorCode.VALIDATION_ERROR);
    }

    const table = await TableModel.findOne({ _id: resolvedTableId, restaurantId });
    if (!table) {
      throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
    }

    if (table.status !== TableStatus.AVAILABLE && table.status !== TableStatus.RESERVED && table.status !== TableStatus.OCCUPIED) {
      throw new AppError('Table is not available for check-in', 400, ErrorCode.VALIDATION_ERROR);
    }

    // 1. Update Table
    table.status = TableStatus.OCCUPIED;
    await table.save();

    // 2. Create TableSession
    const sessionToken = await generateSecureToken();
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

    const tableSession = await TableSessionModel.create([
      {
        restaurantId,
        tableId: table._id,
        customerName: reservation.customerName,
        mobile: reservation.mobile || '0000000000',
        sessionToken,
        sessionStart: new Date(),
        expiresAt,
        reservationId: reservation._id,
        customerProfileId: reservation.customerProfileId,
        status: SessionStatus.ACTIVE,
      },
    ]);

    table.currentSessionId = tableSession[0]._id;
    await table.save();

    // 3. Update Reservation
    reservation.status = ReservationStatus.CHECKED_IN;
    reservation.tableId = table._id;
    if (!reservation.mobile) {
      reservation.mobile = '0000000000';
    }
    await reservation.save();

    // 4. Update Customer Profile (increment visit)
    if (reservation.customerProfileId) {
      await CustomerProfileModel.updateOne(
        { _id: reservation.customerProfileId },
        {
          $inc: { totalVisits: 1 },
          $set: { lastVisitAt: new Date() },
        }
      );
    }

    return await this.getReservationById(restaurantId, id);
  }

  static async getAvailability(restaurantId: string, date: string, guests: number) {
    // A simplified availability check.
    // In reality, this would check table capacities and existing reservations for that date.
    const tables = await TableModel.find({ restaurantId, capacity: { $gte: guests } }).lean();

    // Hardcoded slots for demonstration, ideally fetched from restaurant settings
    const baseSlots = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

    const reservations = await ReservationModel.find({
      restaurantId,
      date,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    }).lean();

    // Map how many tables are booked per slot
    const slotBookings = reservations.reduce((acc, res) => {
      acc[res.slot] = (acc[res.slot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Filter slots where bookings < available tables
    const availableSlots = baseSlots.filter(
      (slot) => (slotBookings[slot] || 0) < tables.length
    );

    return availableSlots;
  }
}
