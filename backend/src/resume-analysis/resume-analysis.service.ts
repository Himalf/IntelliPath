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
    // 1. Verify user
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not Found');

    // 2. Extract text from PDF
    const data = await pdfParse(file.buffer);
    const text = data.text;

    // 3. Build the prompt
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

    // 5. Clean & Parse AI response
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

      // Validate keys
      if (!parsed.strengths || !parsed.weaknesses || !parsed.recommendations) {
        throw new Error('Missing keys');
      }
    } catch (err) {
      throw new InternalServerErrorException(
        'Invalid AI resume analysis format',
      );
    }

    // 6. Save to DB
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
    try {
      // Only try to convert if it's a valid ObjectId format
      if (Types.ObjectId.isValid(userId)) {
        return this.resumeModel
          .find({ user_id: new Types.ObjectId(userId) })
          .exec();
      } else {
        // If not a valid ObjectId, try searching by the string directly
        // This assumes you might be storing user_id as a string in some documents
        return this.resumeModel.find({ user_id: userId }).exec();
      }
    } catch (error) {
      console.error('Error finding resume analyses:', error);
      throw error;
    }
  }

  async findAllAnalyses(): Promise<ResumeAnalysis[]> {
    try {
      return this.resumeModel.find().exec();
    } catch (error) {
      console.error('Error finding all resume analyses:', error);
      throw new InternalServerErrorException(
        'Error retrieving all resume analyses',
      );
    }
  }
}
