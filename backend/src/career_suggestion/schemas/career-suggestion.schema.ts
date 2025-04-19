import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
export type CareerDocument = CareerSuggestion & Document;

@Schema({ timestamps: true })
export class CareerSuggestion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;
  @Prop()
  suggestedCareers: string;
  @Prop()
  skillGapAnalysis: string;
  @Prop()
  recommended_courses: string;
}
export const CareerSuggestionSchema =
  SchemaFactory.createForClass(CareerSuggestion);
