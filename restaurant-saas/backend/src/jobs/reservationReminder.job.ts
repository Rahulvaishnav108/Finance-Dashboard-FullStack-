import cron from 'node-cron';
import logger from '../config/logger';
import { ReservationModel, NotificationPreference } from '../modules/reservations/reservations.model';
import { ReservationStatus } from '../constants/statuses';
import { MessagingService } from '../services/messaging.service';
import { RestaurantModel } from '../modules/restaurants/restaurants.model';

export async function processReservationReminders() {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find reservations that are confirmed and haven't had a reminder sent
    const reservations = await ReservationModel.find({
      status: ReservationStatus.CONFIRMED,
      reminderSent: false,
      notificationPreference: { $ne: NotificationPreference.NONE }
    });

    for (const reservation of reservations) {
      try {
        const [year, month, day] = reservation.date.split('-').map(Number);
        const [hour, minute] = reservation.slot.split(':').map(Number);

        const reservationTime = new Date(year, month - 1, day, hour, minute);

        // If the reservation is within the next 1 hour and in the future
        if (reservationTime > now && reservationTime <= oneHourFromNow) {
          const restaurant = await RestaurantModel.findById(reservation.restaurantId).lean();
          if (!restaurant) continue;

          const data = {
            customerName: reservation.customerName,
            restaurantName: restaurant.name,
            time: reservation.slot,
            date: reservation.date,
            guestCount: String(reservation.guests)
          };

          let success = false;
          if (reservation.notificationPreference === NotificationPreference.SMS) {
            success = await MessagingService.sendSMS(reservation.mobile, 'reservation-reminder', data);
          } else if (reservation.notificationPreference === NotificationPreference.WHATSAPP) {
            success = await MessagingService.sendWhatsApp(reservation.mobile, 'reservation-reminder', data);
          }

          if (success) {
            await ReservationModel.updateOne({ _id: reservation._id }, {
              reminderSent: true,
              reminderSentAt: new Date(),
              reminderFailureReason: null
            });
          } else {
            await ReservationModel.updateOne({ _id: reservation._id }, {
              reminderFailureReason: 'Failed to send reminder via provider'
            });
          }
        }
      } catch (err) {
        logger.error(`Error parsing date/time for reservation ${reservation._id}`, err);
      }
    }
  } catch (error) {
    logger.error('Critical failure in processReservationReminders job', { error });
  }
}

export function startReservationReminderJob() {
  cron.schedule('*/10 * * * *', () => {
    logger.info('Cron triggered: processReservationReminders');
    void processReservationReminders();
  });

  logger.info('Reservation reminder cron job scheduled (every 10 minutes)');
}