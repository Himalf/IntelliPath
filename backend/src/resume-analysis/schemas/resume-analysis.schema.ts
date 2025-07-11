import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

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

  @Prop([
    {
      title: { type: String, required: true },
      url: { type: String, required: true },
    },
  ])
  jobRecommendations: { title: string; url: string }[];
}

export const ResumeAnalysisSchema =
  SchemaFactory.createForClass(ResumeAnalysis);

// Index to speed up user-specific lookups
ResumeAnalysisSchema.index({ user_id: 1 });
ResumeAnalysisSchema.index({ strengths: 1 });
ResumeAnalysisSchema.index({ weakness: 1 });
ResumeAnalysisSchema.index({ recommendation: 1 });
