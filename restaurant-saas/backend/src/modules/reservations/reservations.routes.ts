import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  createReservationBodySchema,
  listReservationsQuerySchema,
  entityIdParamsSchema,
  updateReservationBodySchema,
  checkInReservationBodySchema,
  reservationAvailabilityQuerySchema,
} from './reservations.schema';
import {
  createReservationController,
  listReservationsController,
  getReservationByIdController,
  updateReservationController,
  checkInReservationController,
  getAvailabilityController,
} from './reservations.controller';

const router = Router();

// Define routes (to be mounted typically under /staff/reservations or /admin/reservations)
router.post('/', validate({ body: createReservationBodySchema }), createReservationController);
router.get('/', validate({ query: listReservationsQuerySchema }), listReservationsController);
router.get('/availability', validate({ query: reservationAvailabilityQuerySchema }), getAvailabilityController);
router.get('/:id', validate({ params: entityIdParamsSchema }), getReservationByIdController);
router.patch('/:id', validate({ params: entityIdParamsSchema, body: updateReservationBodySchema }), updateReservationController);
router.patch('/:id/check-in', validate({ params: entityIdParamsSchema, body: checkInReservationBodySchema }), checkInReservationController);

export default router;
