import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  createOfferBodySchema,
  offerIdParamsSchema,
  offersQuerySchema,
  updateOfferBodySchema,
} from './offers.schema';
import {
  createOfferController,
  deleteOfferController,
  getOfferByIdController,
  listOffersController,
  updateOfferController,
} from './offers.controller';

const router = Router();

router.post('/', validate({ body: createOfferBodySchema }), createOfferController);
router.get('/', validate({ query: offersQuerySchema }), listOffersController);
router.get('/:id', validate({ params: offerIdParamsSchema }), getOfferByIdController);
router.patch('/:id', validate({ params: offerIdParamsSchema, body: updateOfferBodySchema }), updateOfferController);
router.delete('/:id', validate({ params: offerIdParamsSchema }), deleteOfferController);

export default router;
