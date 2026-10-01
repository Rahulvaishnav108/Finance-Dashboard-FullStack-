import { Types } from 'mongoose';
import { CleaningStatus, Priority, RequestStatus, RequestType } from '../../constants/statuses';
import { CleaningTaskModel, type ICleaningTask } from './cleaning.model';
import { StaffRequestModel } from '../staff/staffRequest.model';

type EnsureCleaningTaskInput = {
  restaurantId: string | Types.ObjectId;
  tableId: string | Types.ObjectId;
  sessionId?: string | Types.ObjectId | null;
  priority?: Priority;
};

async function resolvePriority(input: EnsureCleaningTaskInput): Promise<Priority> {
  if (input.priority) {
    return input.priority;
  }

  if (!input.sessionId) {
    return Priority.NORMAL;
  }

  const hasCleaningRequest = await StaffRequestModel.exists({
    restaurantId: input.restaurantId,
    sessionId: input.sessionId,
    tableId: input.tableId,
    type: RequestType.CLEANING,
    status: { $in: [RequestStatus.PENDING, RequestStatus.ACCEPTED] },
  });

  return hasCleaningRequest ? Priority.HIGH : Priority.NORMAL;
}

export async function ensureCleaningTaskForTable(input: EnsureCleaningTaskInput): Promise<ICleaningTask> {
  const priority = await resolvePriority(input);
  const existingTask = await CleaningTaskModel.findOne({
    restaurantId: input.restaurantId,
    tableId: input.tableId,
  }).sort({ createdAt: -1 });

  if (
    existingTask &&
    existingTask.status !== CleaningStatus.VERIFIED &&
    existingTask.status !== CleaningStatus.COMPLETED
  ) {
    existingTask.priority = priority;
    existingTask.status = CleaningStatus.PENDING;
    existingTask.startedBy = null;
    existingTask.completedBy = null;
    existingTask.verifiedBy = null;
    existingTask.startedAt = null;
    existingTask.completedAt = null;
    existingTask.verifiedAt = null;
    await existingTask.save();
    return existingTask;
  }

  return CleaningTaskModel.create({
    restaurantId: input.restaurantId,
    tableId: input.tableId,
    priority,
    status: CleaningStatus.PENDING,
    startedBy: null,
    completedBy: null,
    verifiedBy: null,
    startedAt: null,
    completedAt: null,
    verifiedAt: null,
  });
}
