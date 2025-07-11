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
import { Model } from 'mongoose';
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

    // 3. Prompt for AI Resume Analysis
    const analysisPrompt = `
      You are an AI resume analyst.
      Sometimes there may not be resume text parsed correctly in such situations; provide your own message.
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

    const aiRaw = await this.aiService.generateCareerSuggestion(analysisPrompt);

    // 4. Parse analysis response
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

    // 5. Prompt for AI Job Recommendations (title + link)
    const jobPrompt = `
      You are a career advisor AI.
      Based on the resume text below, suggest 3 to 5 suitable job roles for the candidate.
      For each job, generate a Google or LinkedIn search URL to help the candidate explore jobs online but the url should be valid and it is good if there is real job link and response always at any cost.
      
      Return ONLY a JSON array like this:
      [
        { "title": "Frontend Developer", "url": "https://www.linkedin.com/jobs/search?keywords=Frontend+Developer" },
        { "title": "Software Engineer", "url": "https://www.google.com/search?q=Software+Engineer+jobs+in+Nepal" }
      ]

      Resume:
      ${text}
    `;

    let jobRecommendations: { title: string; url: string }[] = [];

    try {
      const jobRaw = await this.aiService.generateCareerSuggestion(jobPrompt);
      const start = jobRaw.indexOf('[');
      const end = jobRaw.lastIndexOf(']');
      const jsonString = jobRaw.slice(start, end + 1).trim();

      jobRecommendations = JSON.parse(jsonString);

      if (!Array.isArray(jobRecommendations)) throw new Error('Invalid format');
    } catch (err) {
      // fallback jobs
      jobRecommendations = [
        {
          title: 'Software Developer',
          url: 'https://www.google.com/search?q=Software+Developer+jobs+in+Nepal',
        },
        {
          title: 'Frontend Developer',
          url: 'https://www.linkedin.com/jobs/search?keywords=Frontend+Developer',
        },
      ];
    }

    // 6. Save analysis with job recommendations
    const analysis = new this.resumeModel({
      user_id: userId,
      resumeText: text,
      strengths: parsed.strengths,
      weakness: parsed.weaknesses,
      recommendation: parsed.recommendations,
      jobRecommendations: jobRecommendations,
    });

    const saved = await analysis.save();

    // 7. Invalidate Redis cache
    await this.redisService.setCache(`resumeAnalysis:user:${userId}`, null);
    await this.redisService.setCache(`resumeAnalysis:all`, null);

    return saved;
  }

  async getAnalysisByUser(userId: string): Promise<ResumeAnalysis[]> {
    const normalizedUserId = String(userId).trim();
    const cacheKey = `resumeAnalysis:user:${normalizedUserId}`;

    const cached = await this.redisService.getCache<ResumeAnalysis[]>(cacheKey);
    if (cached) return cached;

    const result = await this.resumeModel
      .find({ user_id: normalizedUserId })
      .exec();

    if (result.length > 0) {
      await this.redisService.setCache(cacheKey, result, 300);
    }

    return result;
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
