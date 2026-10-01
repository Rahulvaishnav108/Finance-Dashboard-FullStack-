import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { CleaningController } from './cleaning.controller';
import {
  cleaningTaskParamsSchema,
  cleaningTaskQuerySchema,
  completeCleaningBodySchema,
  startCleaningBodySchema,
  verifyCleaningBodySchema,
} from './cleaning.schema';

const router = Router();

router.get('/tasks', validate({ query: cleaningTaskQuerySchema }), CleaningController.getTasks);
router.get('/tasks/:id', validate({ params: cleaningTaskParamsSchema }), CleaningController.getTask);
router.patch(
  '/tasks/:id/start',
  validate({ params: cleaningTaskParamsSchema, body: startCleaningBodySchema }),
  CleaningController.startTask,
);
router.patch(
  '/tasks/:id/complete',
  validate({ params: cleaningTaskParamsSchema, body: completeCleaningBodySchema }),
  CleaningController.completeTask,
);
router.patch(
  '/tasks/:id/verify',
  validate({ params: cleaningTaskParamsSchema, body: verifyCleaningBodySchema }),
  CleaningController.verifyTask,
);

export default router;
