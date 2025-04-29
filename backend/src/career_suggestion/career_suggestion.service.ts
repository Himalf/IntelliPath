import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CareerDocument,
  CareerSuggestion,
} from './schemas/career-suggestion.schema';
import { Model } from 'mongoose';
import { AiService } from 'src/ai/ai.service';
import { CourseService } from 'src/course/course.service';
import { RedisService } from 'src/redis/redis.provider';

@Injectable()
export class CareerSuggestionService {
  constructor(
    @InjectModel(CareerSuggestion.name)
    private readonly suggestionModel: Model<CareerDocument>,
    private readonly aiService: AiService,
    private readonly courseService: CourseService,
    private readonly redisService: RedisService,
  ) {}

  async generateSuggestion(
    userId: string,
    skills: string,
  ): Promise<CareerSuggestion> {
    const existing = await this.suggestionModel.findOne({
      user_id: userId,
      skills,
    });
    if (existing) {
      return existing;
    }

    const prompt = `
    You are a career advisor AI.

    A user has the following skills: ${skills}

    Based on these, respond in the following JSON format:
    {
      "suggestedCareers": "Software Engineer, Frontend Developer",
      "skillGapAnalysis": "Improve TypeScript, CI/CD practices",
      "recommended_courses": "AWS Certified Machine Learning Specialty, Google Cloud Professional Machine Learning Engineer"
    }
    `;

    let parsedResponse: {
      suggestedCareers: any;
      skillGapAnalysis: any;
      recommended_courses: string;
    };

    try {
      const suggestionText =
        await this.aiService.generateCareerSuggestion(prompt);
      const start = suggestionText.indexOf('{');
      const end = suggestionText.lastIndexOf('}');
      const jsonString = suggestionText.slice(start, end + 1);
      parsedResponse = JSON.parse(jsonString);
    } catch (error) {
      throw new InternalServerErrorException('Error parsing AI response');
    }

    const courseTitles = parsedResponse.recommended_courses
      .split(',')
      .map((title: string) => title.trim());

    const matchedCourses =
      await this.courseService.findCoursesByTitles(courseTitles);

    const uniqueCourses = Array.from(
      new Set(matchedCourses.map((course) => course['_id'].toString())),
    );

    const newSuggestion = new this.suggestionModel({
      user_id: userId,
      suggestedCareers: parsedResponse.suggestedCareers,
      skillGapAnalysis: parsedResponse.skillGapAnalysis,
      recommended_courses: uniqueCourses,
    });

    const saved = await newSuggestion.save();

    // Invalidate related cache
    await this.redisService.setCache(`careerSuggestions:user:${userId}`, null);
    await this.redisService.setCache(`careerSuggestions:all`, null);

    return this.suggestionModel
      .findById(saved._id)
      .populate('recommended_courses', 'title description url')
      .exec();
  }

  async getSuggestionsByUser(userId: string) {
    const cacheKey = `careerSuggestions:user:${userId}`;
    const cached =
      await this.redisService.getCache<CareerSuggestion[]>(cacheKey);
    if (cached) return cached;

    const suggestions = await this.suggestionModel
      .find({ user_id: userId })
      .populate('recommended_courses', 'title description url')
      .exec();

    await this.redisService.setCache(cacheKey, suggestions, 300); // 5 mins
    return suggestions;
  }

  async findAllSuggestions(): Promise<CareerSuggestion[]> {
    const cacheKey = `careerSuggestions:all`;
    const cached =
      await this.redisService.getCache<CareerSuggestion[]>(cacheKey);
    if (cached) return cached;

    try {
      const suggestions = await this.suggestionModel
        .find()
        .populate('recommended_courses', 'title description url')
        .exec();

      await this.redisService.setCache(cacheKey, suggestions, 300);
      return suggestions;
    } catch (error) {
      console.error('Error finding all career suggestions:', error);
      throw new InternalServerErrorException(
        'Error retrieving all career suggestions',
      );
    }
  }

  async deleteSuggestion(id: string) {
    const suggestion = await this.suggestionModel.findById(id);
    if (suggestion) {
      await this.redisService.setCache(
        `careerSuggestions:user:${suggestion.user_id}`,
        null,
      );
      await this.redisService.setCache(`careerSuggestions:all`, null);
    }
    return this.suggestionModel.findOneAndDelete({ _id: id });
  }
}
