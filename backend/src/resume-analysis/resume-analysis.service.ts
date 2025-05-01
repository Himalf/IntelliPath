import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ResumeAnalysis,
  ResumeAnalysisDocument,
} from './schemas/resume-analysis.schema';
import { Model, Types } from 'mongoose';
import { AiService } from 'src/ai/ai.service';
import { UsersService } from 'src/users/users.service';
import * as pdfParse from 'pdf-parse';
import { RedisService } from 'src/redis/redis.provider';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    @InjectModel(ResumeAnalysis.name)
    private readonly resumeModel: Model<ResumeAnalysisDocument>,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  async analyzeResume(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ResumeAnalysis> {
    // 1. Verify user
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    // 2. Extract PDF text
    const data = await pdfParse(file.buffer);
    const text = data.text;

    // 3. Prompt for AI
    const prompt = `
      You are an AI resume analyst.
      Analyze the following resume text and return JSON with these exact keys:
      {
        "strengths": ["..."],
        "weaknesses": ["..."],
        "recommendations": ["..."]
      }
      Return ONLY the JSON. No explanation or notes.
      Resume:
      ${text}
    `;

    // 4. Get AI response
    const aiRaw = await this.aiService.generateCareerSuggestion(prompt);

    // 5. Parse response
    let parsed: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };

    try {
      const start = aiRaw.indexOf('{');
      const end = aiRaw.lastIndexOf('}');
      const jsonString = aiRaw.slice(start, end + 1);
      const cleaned = jsonString
        .replace(/(\r\n|\n|\r)/gm, '')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .trim();

      parsed = JSON.parse(cleaned);

      if (!parsed.strengths || !parsed.weaknesses || !parsed.recommendations) {
        throw new Error('Missing keys');
      }
    } catch (err) {
      throw new InternalServerErrorException(
        'Invalid AI resume analysis format',
      );
    }

    // 6. Save analysis
    const analysis = new this.resumeModel({
      user_id: userId,
      resumeText: text,
      strengths: parsed.strengths,
      weakness: parsed.weaknesses,
      recommendation: parsed.recommendations,
    });

    const saved = await analysis.save();

    // 7. Invalidate cache
    await this.redisService.setCache(`resumeAnalysis:user:${userId}`, null);
    await this.redisService.setCache(`resumeAnalysis:all`, null);

    return saved;
  }

  async getAnalysisByUser(userId: string): Promise<ResumeAnalysis[]> {
    const cacheKey = `resumeAnalysis:user:${userId}`;
    const cached = await this.redisService.getCache<ResumeAnalysis[]>(cacheKey);
    if (cached) return cached;

    try {
      const query = Types.ObjectId.isValid(userId)
        ? { user_id: new Types.ObjectId(userId) }
        : { user_id: userId };

      const result = await this.resumeModel.find(query).exec();

      await this.redisService.setCache(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error('Error finding resume analyses:', error);
      throw error;
    }
  }

  async findAllAnalyses(): Promise<ResumeAnalysis[]> {
    const cacheKey = `resumeAnalysis:all`;
    const cached = await this.redisService.getCache<ResumeAnalysis[]>(cacheKey);
    if (cached) return cached;

    try {
      const all = await this.resumeModel.find().exec();
      await this.redisService.setCache(cacheKey, all, 300);
      return all;
    } catch (error) {
      console.error('Error finding all resume analyses:', error);
      throw new InternalServerErrorException(
        'Error retrieving all resume analyses',
      );
    }
  }

  async deleteAnalyses(id: string) {
    const analysis = await this.resumeModel.findById(id);
    if (analysis) {
      await this.redisService.setCache(
        `resumeAnalysis:user:${analysis.user_id}`,
        null,
      );
      await this.redisService.setCache(`resumeAnalysis:all`, null);
    }
    return this.resumeModel.findByIdAndDelete(id);
  }
}
