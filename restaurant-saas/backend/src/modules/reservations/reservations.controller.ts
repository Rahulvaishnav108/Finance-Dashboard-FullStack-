import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { ReservationsService } from './reservations.service';
import { ReservationStatus } from '../../constants/statuses';

function resolveRestaurantId(req: Request, candidate?: unknown): string {
  if (req.user?.restaurantId) {
    return req.user.restaurantId;
  }
  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }
  throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
}

// Map database entity to match the frontend contract explicitly
function mapReservationDto(reservation: any) {
  return {
    id: reservation._id?.toString() || reservation.id,
    tableNumber: reservation.tableId?.tableNumber || '',
    guestName: reservation.customerName,
    partySize: reservation.guests,
    time: reservation.slot,
    status: reservation.status.toLowerCase(),
  };
}

export async function createReservationController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId);

    const reservation = await ReservationsService.createReservation({
      restaurantId,
      customerName: req.body.customerName,
      mobile: req.body.mobile,
      guests: req.body.guests,
      date: req.body.date,
      slot: req.body.slot,
      notes: req.body.notes,
    });

    ok(res, { reservation: mapReservationDto(reservation) }, 201);
  } catch (error) {
    next(error);
  }
}

export async function listReservationsController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);

    const filters = {
      date: typeof req.query.date === 'string' ? req.query.date : undefined,
      status: req.query.status as ReservationStatus | undefined,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
    };

    const reservations = await ReservationsService.listReservations(restaurantId, filters);

    ok(res, {
      reservations: reservations.map(mapReservationDto),
      meta: { count: reservations.length },
    });
  } catch (error) {
    next(error);
  }
}

export async function getReservationByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const reservation = await ReservationsService.getReservationById(restaurantId, req.params.id);

    ok(res, { reservation: mapReservationDto(reservation) });
  } catch (error) {
    next(error);
  }
}

export async function updateReservationController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);

    const reservation = await ReservationsService.updateReservation(
      restaurantId,
      req.params.id,
      req.body
    );

    ok(res, { reservation: mapReservationDto(reservation) });
  } catch (error) {
    next(error);
  }
}

export async function checkInReservationController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);
    // Usually the staff provides the tableId during check-in, or it's pre-assigned.
    // If not in body, we might need to rely on existing tableId on reservation.
    // Assuming tableId is required in body per schema.
    const tableId = req.body.tableId;

    const reservation = await ReservationsService.checkInReservation(
      restaurantId,
      req.params.id,
      tableId
    );

    ok(res, { reservation: mapReservationDto(reservation) });
  } catch (error) {
    next(error);
  }
}

export async function getAvailabilityController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().split('T')[0];
    const guests = typeof req.query.guests === 'number' ? req.query.guests : 2;

    const slots = await ReservationsService.getAvailability(restaurantId, date, guests);

    // Frontend expects an array of slots or specific format. We align with `public.routes.ts` return format: `{ slots }`
    ok(res, {
      slots,
      meta: { count: slots.length },
    });
  } catch (error) {
    next(error);
  }
}
