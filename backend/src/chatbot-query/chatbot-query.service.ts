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
import { Model } from 'mongoose';
import { AiService } from 'src/ai/ai.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatbotQueriesService {
  constructor(
    @InjectModel(ChatbotQuery.name)
    private readonly chatbotQueryModel: Model<ChatbotQueryDocument>,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
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
      userId: user._id, // Use 'userId' as defined in your schema
      question,
      response: responseObject.response, // Store as a JSON object
    });

    return chatbotQuery.save();
  }

  async findByUser(userId: string): Promise<ChatbotQuery[]> {
    return this.chatbotQueryModel.find({ user_id: userId }).exec();
  }
}
