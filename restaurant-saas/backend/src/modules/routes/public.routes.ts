import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { sessionLimiter } from '../../middleware/rateLimiters';
import {
  initTableSessionController,
  createTableSessionController,
  validateTableSessionController,
  recoverSession,
} from '../tableSessions/tableSessions.controller';
import { getAvailabilityController } from '../reservations/reservations.controller';
import { joinQueueController } from '../queue/queue.controller';
import { reservationAvailabilityQuerySchema } from '../reservations/reservations.schema';
import { publicQueueJoinBodySchema } from '../queue/queue.schema';
import { MenuItem, Category } from '../menu/menu.model';
import { RestaurantModel } from '../restaurants/restaurants.model';
import { ok } from '../../utils/responses';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { z } from 'zod';

export const publicRouter = Router();

// ── POST /api/v1/public/table-session/init ───────────────────────────
// Body: { token: string }
// Called when a customer scans the QR code on the table
const initSessionBodySchema = z.object({
  token: z.string().trim().min(1, 'Token is required'),
});

publicRouter.post(
  '/table-session/init',
  sessionLimiter,
  validate({ body: initSessionBodySchema }),
  initTableSessionController,
);

publicRouter.post(
  '/table-session/create',
  sessionLimiter,
  createTableSessionController,
);

publicRouter.post(
  '/table-session/validate',
  validateTableSessionController,
);

publicRouter.get(
  '/table-session/recover',
  recoverSession,
);

publicRouter.get(
  '/reservations/availability',
  validate({ query: reservationAvailabilityQuerySchema }),
  getAvailabilityController,
);

publicRouter.post(
  '/queue/join',
  validate({ body: publicQueueJoinBodySchema }),
  joinQueueController,
);

// ── GET /api/v1/public/menu?restaurantId=xxx ─────────────────────────
// Returns the full menu for a restaurant (public, no auth needed)
publicRouter.get('/menu', async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId || typeof restaurantId !== 'string') {
      throw new AppError('restaurantId query parameter is required', 400, ErrorCode.INVALID_REQUEST);
    }

    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404, ErrorCode.NOT_FOUND);
    }

    const categories = await Category.find({
      restaurantId,
      isActive: true,
      isHidden: false,
    }).sort({ displayOrder: 1 });

    const menuItems = await MenuItem.find({
      restaurantId,
      isHidden: false,
    }).sort({ displayOrder: 1 });

    ok(res, {
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        settings: restaurant.settings,
      },
      categories,
      menuItems,
    });
  } catch (error) {
    next(error);
  }
});
