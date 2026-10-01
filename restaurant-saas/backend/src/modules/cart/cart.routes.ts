import { Router } from 'express';
import { requireSession } from '../../middleware/requireSession';
import { validate } from '../../middleware/validate';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from './cart.controller';
import {
  addItemBodySchema,
  updateItemBodySchema,
  itemIdParamsSchema,
} from './cart.schema';

const router = Router();

// All customer cart routes require an active table session
router.use(requireSession);

router.get('/', getCart);
router.post('/items', validate({ body: addItemBodySchema }), addItemToCart);
router.patch('/items/:itemId', validate({ body: updateItemBodySchema, params: itemIdParamsSchema }), updateCartItem);
router.delete('/items/:itemId', validate({ params: itemIdParamsSchema }), removeCartItem);
router.delete('/', clearCart);

export default router;
