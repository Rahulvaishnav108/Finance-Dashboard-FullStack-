import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  joinQueueBodySchema,
  listQueueQuerySchema,
  entityIdParamsSchema,
  updateQueuePriorityBodySchema,
  seatWalkInBodySchema,
} from './queue.schema';
import {
  joinQueueController,
  listQueueController,
  getQueueEntryByIdController,
  updateQueuePriorityController,
  seatWalkInController,
  cancelQueueController,
} from './queue.controller';

const router = Router();

router.post('/', validate({ body: joinQueueBodySchema }), joinQueueController);
router.get('/', validate({ query: listQueueQuerySchema }), listQueueController);
router.get('/:id', validate({ params: entityIdParamsSchema }), getQueueEntryByIdController);
router.patch('/:id/priority', validate({ params: entityIdParamsSchema, body: updateQueuePriorityBodySchema }), updateQueuePriorityController);
router.patch('/:id/seat', validate({ params: entityIdParamsSchema, body: seatWalkInBodySchema }), seatWalkInController);
router.patch('/:id/cancel', validate({ params: entityIdParamsSchema }), cancelQueueController);

export default router;
