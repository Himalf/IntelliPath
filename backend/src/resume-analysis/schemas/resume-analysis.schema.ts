import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
export type ResumeAnalysisDocument = ResumeAnalysis & Document;
@Schema({ timestamps: true })
export class ResumeAnalysis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;
  @Prop()
  resumeText: string;
  @Prop([String])
  strengths: string[];
  @Prop([String])
  weakness: string[];
  @Prop([String])
  recommendation: string[];
}
export const ResumeAnalysisSchema =
  SchemaFactory.createForClass(ResumeAnalysis);
