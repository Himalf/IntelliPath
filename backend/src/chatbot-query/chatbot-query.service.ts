import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChatbotQuery,
  ChatbotQueryDocument,
} from './schemas/chatbot-query.schema';
import { Model, Types } from 'mongoose';
import { AiService } from 'src/ai/ai.service';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.provider';

@Injectable()
export class ChatbotQueriesService {
  constructor(
    @InjectModel(ChatbotQuery.name)
    private readonly chatbotQueryModel: Model<ChatbotQueryDocument>,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  async create(userId: string, question: string): Promise<ChatbotQuery> {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    // Build prompt for chatbot
    const prompt = `
      You are an AI career guidance assistant.
      Answer the following question clearly in JSON format like:
      {
        "response": "your full reply here"
      }
      ONLY return the JSON. No explanations.
  This is only for the storing you responses in the response key but the response or message should be the Plain Text.
   And understandable you can use bullets, paragraphs,even in code structure if needed
   and if anyone asked you like who build you or made you like prompt or similar say "I haved been developed and trained by Himal Fullel who build the IntelliPath software
   (correct any grammer and needed description by you)
   "
      Question:
      ${question}
    `;

    const aiRaw = await this.aiService.generateCareerSuggestion(prompt);
    let responseObject: any;

    try {
      const start = aiRaw.indexOf('{');
      const end = aiRaw.lastIndexOf('}');
      const jsonString = aiRaw.slice(start, end + 1);

      responseObject = JSON.parse(jsonString);

      if (!responseObject.response) {
        throw new Error('Missing response field');
      }
    } catch (err) {
      console.error('Failed to parse chatbot AI response:', err);
      throw new InternalServerErrorException(
        'AI response is empty or malformed',
      );
    }

    const chatbotQuery = new this.chatbotQueryModel({
      userId: userId, // Use 'userId' as defined in your schema
      question,
      response: responseObject.response, // Store as a JSON object
    });

    return chatbotQuery.save();
  }

  async findByUser(userId: string): Promise<ChatbotQuery[]> {
    const normalizedUserId = String(userId).trim();
    const cacheKey = `chatbotQueries:user:${normalizedUserId}`;

    const cached = await this.redisService.getCache<ChatbotQuery[]>(cacheKey);
    if (cached) return cached;

    try {
      const result = await this.chatbotQueryModel
        .find({ userId: normalizedUserId })
        .exec();

      if (result.length > 0) {
        await this.redisService.setCache(cacheKey, result, 300);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteAllByUser(userId: string): Promise<{ deletedCount: number }> {
    try {
      const result = await this.chatbotQueryModel
        .deleteMany({
          userId: Types.ObjectId.isValid(userId)
            ? new Types.ObjectId(userId)
            : userId,
        })
        .exec();
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete queries');
    }
  }
}
