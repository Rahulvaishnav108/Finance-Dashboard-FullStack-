import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';

import { FeedbackModel } from './feedback.model';
import { TableSessionModel } from '../tableSessions/tableSessions.model';

import { SessionStatus } from '../../constants/statuses';

import type { CreateFeedbackInput } from './feedback.schema';

export async function createFeedback(
  sessionId: string,
  restaurantId: string,
  input: CreateFeedbackInput
) {
  const session = await TableSessionModel.findOne({
    _id: sessionId,
    restaurantId,
  });
  if (
  session?.feedbackExpiresAt &&
  new Date() > session.feedbackExpiresAt
) {
  throw new AppError(
    'Feedback window has expired',
    400,
    ErrorCode.INVALID_REQUEST
  );
}

  if (!session) {
    throw new AppError(
      'Session not found',
      404,
      ErrorCode.NOT_FOUND
    );
  }

 if (session.status === SessionStatus.EXPIRED) {
  throw new AppError(
    'Session has expired',
    400,
    ErrorCode.TABLE_SESSION_EXPIRED
  );
}

  const existingFeedback = await FeedbackModel.findOne({
    sessionId,
  });

  if (existingFeedback) {
    throw new AppError(
      'Feedback already submitted',
      409,
      ErrorCode.CONFLICT
    );
  }

  const feedback = await FeedbackModel.create({
    restaurantId,
    sessionId,
    rating: input.rating,
    comment: input.comment ?? '',
  });

  return feedback;
}

export async function getFeedbackBySession(
  sessionId: string
) {
  return FeedbackModel.findOne({
    sessionId,
  });
}