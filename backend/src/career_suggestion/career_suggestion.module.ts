import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CareerSuggestion,
  CareerSuggestionSchema,
} from './schemas/career-suggestion.schema';
import { CareerSuggestionService } from './career_suggestion.service';
import { CareerSuggestionController } from './career_suggestion.controller';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CareerSuggestion.name, schema: CareerSuggestionSchema },
    ]),
    AiModule,
  ],
  providers: [CareerSuggestionService],
  controllers: [CareerSuggestionController],
})
export class CareerSuggestionModule {}
