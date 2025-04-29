import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Course } from 'src/course/schemas/course.schema';

export type CareerDocument = CareerSuggestion & Document;

@Schema({ timestamps: true })
export class CareerSuggestion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop()
  suggestedCareers: string;

  @Prop()
  skillGapAnalysis: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Course.name }] })
  recommended_courses: Types.ObjectId[];
}

export const CareerSuggestionSchema =
  SchemaFactory.createForClass(CareerSuggestion);

//  Index to speed up user-specific lookups
CareerSuggestionSchema.index({ user_id: 1 });

// Optional index if you frequently filter/search by suggestedCareers
CareerSuggestionSchema.index({ suggestedCareers: 1 });
