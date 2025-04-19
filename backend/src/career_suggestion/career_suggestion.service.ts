import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CareerSuggestion } from './schemas/career-suggestion.schema';
import { Model } from 'mongoose';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class CareerSuggestionService {
  constructor(
    @InjectModel(CareerSuggestion.name)
    private readonly suggestionModel: Model<CareerSuggestion>,
    private readonly aiService: AiService,
  ) {}

  async generateSuggestion(
    userId: string,
    skills: string,
  ): Promise<CareerSuggestion> {
    const prompt = `I have skills in ${skills}. Suggest best career paths and skill gaps.`;
    const suggestionText =
      await this.aiService.generateCareerSuggestion(prompt);
    const newSuggestion = new this.suggestionModel({
      user_id: userId,
      suggestedCareers: suggestionText,
      skillGapAnalysis: '',
      recommended_courses: '',
    });
    return await newSuggestion.save();
  }
  async getSuggestionsByUser(userId: string) {
    return this.suggestionModel.find({
      user_id: userId,
    });
  }
}
