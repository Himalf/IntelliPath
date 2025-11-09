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

    const aiRaw = await this.aiService.generateResumeAnalysis(analysisPrompt);

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
You are a career advisor AI. Based on the resume text below, suggest 3 to 5 suitable job roles for the candidate.

IMPORTANT: Return ONLY a valid JSON array with no additional text, explanations, or markdown formatting.

Format:
[
  {"title": "Job Title 1", "url": "https://www.linkedin.com/jobs/search?keywords=Job+Title+1"},
  {"title": "Job Title 2", "url": "https://www.linkedin.com/jobs/search?keywords=Job+Title+2"}
]

Resume text:
${text}
    `;

    let jobRecommendations: { title: string; url: string }[] = [];
    let jobRaw = '';

    try {
      jobRaw = await this.aiService.generateResumeAnalysis(jobPrompt);

      // Enhanced debugging
      console.log('=== JOB RECOMMENDATIONS DEBUG ===');
      console.log('Raw AI response length:', jobRaw.length);
      console.log('Raw AI response:', JSON.stringify(jobRaw));
      console.log('First 200 chars:', jobRaw.substring(0, 200));
      console.log('Last 200 chars:', jobRaw.substring(jobRaw.length - 200));

      // Try multiple parsing strategies
      let parsed: any[] = [];
      let parseSuccess = false;

      // Strategy 1: Direct JSON parse (if AI returns clean JSON)
      try {
        const trimmed = jobRaw.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          parsed = JSON.parse(trimmed);
          parseSuccess = true;
          console.log('✓ Strategy 1 succeeded: Direct JSON parse');
        }
      } catch (e) {
        console.log('✗ Strategy 1 failed:', e.message);
      }

      // Strategy 2: Extract JSON from response
      if (!parseSuccess) {
        try {
          const start = jobRaw.indexOf('[');
          const end = jobRaw.lastIndexOf(']');

          if (start !== -1 && end !== -1 && end > start) {
            let jsonString = jobRaw.slice(start, end + 1);

            // Multiple cleaning attempts
            const cleaningSteps = [
              (str: string) => str.trim(),
              (str: string) => str.replace(/```json\s*|\s*```/g, ''),
              (str: string) => str.replace(/(\r\n|\n|\r)/gm, ' '),
              (str: string) => str.replace(/\s+/g, ' '),
              (str: string) => str.replace(/,\s*]/g, ']'),
              (str: string) => str.replace(/,\s*}/g, '}'),
              (str: string) => str.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''),
            ];

            for (const clean of cleaningSteps) {
              jsonString = clean(jsonString);
            }

            console.log('Cleaned JSON string:', jsonString);

            parsed = JSON.parse(jsonString);
            parseSuccess = true;
            console.log('✓ Strategy 2 succeeded: Extracted and cleaned JSON');
          }
        } catch (e) {
          console.log('✗ Strategy 2 failed:', e.message);
        }
      }

      // Strategy 3: Regex extraction for job titles and create URLs
      if (!parseSuccess) {
        try {
          const titleRegex = /"title":\s*"([^"]+)"/g;
          const titles: string[] = [];
          let match;

          while ((match = titleRegex.exec(jobRaw)) !== null) {
            titles.push(match[1]);
          }

          if (titles.length > 0) {
            parsed = titles.map((title) => ({
              title: title,
              url: `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(title)}`,
            }));
            parseSuccess = true;
            console.log('✓ Strategy 3 succeeded: Regex extraction');
          }
        } catch (e) {
          console.log('✗ Strategy 3 failed:', e.message);
        }
      }

      // Validate the parsed result
      if (parseSuccess && Array.isArray(parsed) && parsed.length > 0) {
        const isValid = parsed.every(
          (job) =>
            job &&
            typeof job === 'object' &&
            typeof job.title === 'string' &&
            typeof job.url === 'string' &&
            job.title.trim() !== '' &&
            job.url.trim() !== '',
        );

        if (isValid) {
          jobRecommendations = parsed;
          console.log(
            '✓ Successfully parsed job recommendations:',
            jobRecommendations,
          );
        } else {
          throw new Error('Invalid job recommendation structure');
        }
      } else {
        throw new Error('No valid job recommendations found');
      }
    } catch (err) {
      console.error('=== JOB RECOMMENDATIONS ERROR ===');
      console.error('Error details:', err);
      console.error('Full AI response:', jobRaw);

      // Enhanced fallback - try to extract job titles from resume text
      try {
        const resumeText = text.toLowerCase();
        const fallbackJobs = [];

        // Common tech roles based on resume keywords
        const roleKeywords = [
          {
            keywords: ['react', 'frontend', 'javascript', 'html', 'css'],
            title: 'Frontend Developer',
          },
          {
            keywords: ['node', 'backend', 'server', 'api', 'database'],
            title: 'Backend Developer',
          },
          {
            keywords: ['fullstack', 'full-stack', 'full stack'],
            title: 'Full Stack Developer',
          },
          {
            keywords: ['mobile', 'android', 'ios', 'react native', 'flutter'],
            title: 'Mobile Developer',
          },
          {
            keywords: ['devops', 'aws', 'docker', 'kubernetes', 'cloud'],
            title: 'DevOps Engineer',
          },
          {
            keywords: ['data', 'analytics', 'python', 'machine learning'],
            title: 'Data Analyst',
          },
          {
            keywords: ['ui', 'ux', 'design', 'figma', 'adobe'],
            title: 'UI/UX Designer',
          },
          {
            keywords: ['qa', 'testing', 'selenium', 'automation'],
            title: 'QA Engineer',
          },
        ];

        for (const role of roleKeywords) {
          if (role.keywords.some((keyword) => resumeText.includes(keyword))) {
            fallbackJobs.push({
              title: role.title,
              url: `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role.title)}`,
            });
          }
        }

        if (fallbackJobs.length > 0) {
          jobRecommendations = fallbackJobs.slice(0, 5); // Limit to 5
          console.log(
            '✓ Used smart fallback based on resume keywords:',
            jobRecommendations,
          );
        } else {
          // Last resort fallback
          jobRecommendations = [
            {
              title: 'Software Developer',
              url: 'https://www.linkedin.com/jobs/search?keywords=Software+Developer',
            },
            {
              title: 'Frontend Developer',
              url: 'https://www.linkedin.com/jobs/search?keywords=Frontend+Developer',
            },
            {
              title: 'Backend Developer',
              url: 'https://www.linkedin.com/jobs/search?keywords=Backend+Developer',
            },
          ];
          console.log('✓ Used default fallback jobs');
        }
      } catch (fallbackErr) {
        console.error('Fallback generation failed:', fallbackErr);
        jobRecommendations = [
          {
            title: 'Software Developer',
            url: 'https://www.linkedin.com/jobs/search?keywords=Software+Developer',
          },
        ];
      }
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
