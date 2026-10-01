import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFeedback extends Document {
  restaurantId: Types.ObjectId;
  sessionId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'TableSession',
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'feedback',
  },
);

// One feedback per dining session

export const FeedbackModel = mongoose.model<IFeedback>(
  'Feedback',
  feedbackSchema
);