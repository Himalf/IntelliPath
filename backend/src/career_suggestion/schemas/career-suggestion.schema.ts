import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
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
