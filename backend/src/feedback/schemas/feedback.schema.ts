import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// 1) Speed up “get all feedback for a given user”
FeedbackSchema.index({ userId: 1 });

// 2) Speed up “filter feedback by rating” (e.g. show all 5-star feedback)
FeedbackSchema.index({ rating: 1 });

// 3) (Optional) Compound index if you often query “feedback for user sorted by rating”
FeedbackSchema.index({ userId: 1, rating: -1 });
