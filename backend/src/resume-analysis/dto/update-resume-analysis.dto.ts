import { PartialType } from '@nestjs/mapped-types';
import { ResumeAnalysis } from '../schemas/resume-analysis.schema';

export class UpdateResumeAnalysisDto extends PartialType(ResumeAnalysis) {}
