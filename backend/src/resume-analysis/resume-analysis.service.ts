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
@Injectable()
export class ResumeAnalysisService {
  constructor(
    @InjectModel(ResumeAnalysis.name)
    private readonly resumeModel: Model<ResumeAnalysisDocument>,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
  ) {}
  async analyzeResume(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ResumeAnalysis> {
    // Verifyi user exists
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not Found');
    // Extracrt text from Pdf Buffer
    const data = await pdfParse(file.buffer);
    const text = data.text;

    // Build your AI prompt
    const prompt = `
    You are an AI resume analyst.
    Analyze the following resume text and return JSON with keys:
    {
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendations": ["..."]
    }
    Resume:
    ${text}
    `;

    // Call AI Service
    const aiRaw = await this.aiService.generateCareerSuggestion(prompt);

    // parse  the response from AI
    let parsed: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    try {
      const start = aiRaw.indexOf('{');
      const end = aiRaw.lastIndexOf('}');
      const jsonString = aiRaw.slice(start, end + 1);
      parsed = JSON.parse(jsonString);
    } catch {
      throw new InternalServerErrorException(
        'Invalid AI resume analysis format',
      );
    }
    // Save the data to the database (mongodb)
    const analysis = new this.resumeModel({
      user_id: user._id,
      resumeText: text,
      strengths: parsed.strengths,
      weakness: parsed.weaknesses,
      recommendation: parsed.recommendations,
    });
    return analysis.save();
  }
  async getAnalysisByUser(userId: string): Promise<ResumeAnalysis[]> {
    return this.resumeModel.find({ user_id: userId }).exec();
  }
}
