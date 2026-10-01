import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import { ok } from '../../utils/responses';

import type {
  CreateFeedbackInput,
} from './feedback.schema';

import * as feedbackService from './feedback.service';

export async function createFeedbackController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input =
      req.body as CreateFeedbackInput;

    const feedback =
      await feedbackService.createFeedback(
        req.tableSession!._id,
        req.tableSession!.restaurantId,
        input
      );

    ok(
      res,
      {
        feedback,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function getFeedbackController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const feedback =
      await feedbackService.getFeedbackBySession(
        req.tableSession!._id
      );

    ok(res, { feedback });
  } catch (error) {
    next(error);
  }
}