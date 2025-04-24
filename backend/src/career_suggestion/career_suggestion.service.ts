import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CareerDocument,
  CareerSuggestion,
} from './schemas/career-suggestion.schema';
import { Model, Types } from 'mongoose';
import { AiService } from 'src/ai/ai.service';
import { Course } from 'src/course/schemas/course.schema';
import { CourseService } from 'src/course/course.service';

@Injectable()
export class CareerSuggestionService {
  constructor(
    @InjectModel(CareerSuggestion.name)
    private readonly suggestionModel: Model<CareerDocument>,
    private readonly aiService: AiService,
    private readonly courseService: CourseService,
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
      "recommended_courses": "AWS Certified Machine Learning Specialty, Google Cloud Professional Machine Learning Engineer"
    }
    `;

    let parsedResponse;
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

    // Split course titles from AI and match with Course documents
    const courseTitles = parsedResponse.recommended_courses
      .split(',')
      .map((title: string) => title.trim());

    const matchedCourses =
      await this.courseService.findCoursesByTitles(courseTitles);

    // Remove duplicates by using a Set or filtering
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
    return this.suggestionModel
      .findById(saved._id)
      .populate('recommended_courses', 'title description url')
      .exec();
  }

  async getSuggestionsByUser(userId: string) {
    return this.suggestionModel
      .find({ user_id: userId })
      .populate('recommended_courses', 'title description url') // Populate course details
      .exec();
  }
  async findAllSuggestions(): Promise<CareerSuggestion[]> {
    try {
      return this.suggestionModel
        .find()
        .populate('recommended_courses', 'title description url') // Populate course details
        .exec();
    } catch (error) {
      console.error('Error finding all career suggestions:', error);
      throw new InternalServerErrorException(
        'Error retrieving all career suggestions',
      );
    }
  }
}
