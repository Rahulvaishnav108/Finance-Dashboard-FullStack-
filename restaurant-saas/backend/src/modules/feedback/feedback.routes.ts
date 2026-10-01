import { Router } from 'express';

import { requireSession } from '../../middleware/requireSession';
import { validate } from '../../middleware/validate';

import {
  createFeedbackSchema,
} from './feedback.schema';

import * as feedbackController from './feedback.controller';

const router = Router();

router.post(
  '/',
  requireSession,
  validate(createFeedbackSchema),
  feedbackController.createFeedbackController
);

router.get(
  '/',
  requireSession,
  feedbackController.getFeedbackController
);

export default router;