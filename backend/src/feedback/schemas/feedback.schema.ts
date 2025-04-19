// src/feedback/schemas/feedback.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: { createdAt: 'submittedAt' } })
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
