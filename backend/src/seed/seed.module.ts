import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ExportController } from './export.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CareerSuggestion, CareerSuggestionSchema } from '../career_suggestion/schemas/career-suggestion.schema';
import { ResumeAnalysis, ResumeAnalysisSchema } from '../resume-analysis/schemas/resume-analysis.schema';
import { ChatbotQuery, ChatbotQuerySchema } from '../chatbot-query/schemas/chatbot-query.schema';
import { Feedback, FeedbackSchema } from '../feedback/schemas/feedback.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CareerSuggestion.name, schema: CareerSuggestionSchema },
      { name: ResumeAnalysis.name, schema: ResumeAnalysisSchema },
      { name: ChatbotQuery.name, schema: ChatbotQuerySchema },
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [SeedController, ExportController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

