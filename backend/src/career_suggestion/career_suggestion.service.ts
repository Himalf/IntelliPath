import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CareerSuggestion } from './schemas/career-suggestion.schema';
import { Model } from 'mongoose';
import { AiService } from 'src/ai/ai.service';
import { InternalServerErrorException } from '@nestjs/common';

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
    const prompt = `
You are a career advisor AI.

A user has the following skills: ${skills}

Based on these, respond in the following JSON format:
{
  "suggestedCareers": "Software Engineer, Frontend Developer",
  "skillGapAnalysis": "Improve TypeScript, CI/CD practices",
  "recommended_courses": "TypeScript Bootcamp, GitHub Actions Essentials"
}
`;

    // Fetch AI-generated response
    const suggestionText =
      await this.aiService.generateCareerSuggestion(prompt);

    // Parse the response to extract the relevant fields
    let parsedResponse;
    try {
      const start = suggestionText.indexOf('{');
      const end = suggestionText.lastIndexOf('}');
      const jsonString = suggestionText.slice(start, end + 1);
      parsedResponse = JSON.parse(jsonString);
    } catch (error) {
      throw new InternalServerErrorException('Error parsing AI response');
    }

    // Create a new CareerSuggestion document with the parsed values
    const newSuggestion = new this.suggestionModel({
      user_id: userId,
      suggestedCareers: parsedResponse.suggestedCareers,
      skillGapAnalysis: parsedResponse.skillGapAnalysis,
      recommended_courses: parsedResponse.recommended_courses,
    });

    // Save the suggestion to the database
    return await newSuggestion.save();
  }

  async getSuggestionsByUser(userId: string) {
    return this.suggestionModel.find({
      user_id: userId,
    });
  }
}
