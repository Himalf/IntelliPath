import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CareerSuggestion,
  CareerSuggestionSchema,
} from './schemas/career-suggestion.schema';
import { CareerSuggestionService } from './career_suggestion.service';
import { CareerSuggestionController } from './career_suggestion.controller';
import { AiModule } from 'src/ai/ai.module';
import { AiService } from 'src/ai/ai.service';
import { CoursesModule } from 'src/course/course.module';
import { Course, CourseSchema } from 'src/course/schemas/course.schema';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CareerSuggestion.name, schema: CareerSuggestionSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    AiModule,
    RedisModule,
    CoursesModule,
  ],
  providers: [CareerSuggestionService, AiService],
  controllers: [CareerSuggestionController],
  exports: [CareerSuggestionService],
})
export class CareerSuggestionModule {}
