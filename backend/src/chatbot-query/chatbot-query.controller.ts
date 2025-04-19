import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CreateChatbotQueryDto } from './dto/create-chatbot-query.dto';
import { ChatbotQuery } from './schemas/chatbot-query.schema';
import { ChatbotQueriesService } from './chatbot-query.service';

@Controller('chatbot-queries')
export class ChatbotQueriesController {
  constructor(private readonly chatbotQueriesService: ChatbotQueriesService) {}

  // POST endpoint to create a new chatbot query
  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() createChatbotQueryDto: CreateChatbotQueryDto,
  ): Promise<ChatbotQuery> {
    const { question } = createChatbotQueryDto;
    return this.chatbotQueriesService.create(userId, question);
  }

  // GET endpoint to fetch chatbot queries for a user
  @Get(':userId')
  async findByUser(@Param('userId') userId: string): Promise<ChatbotQuery[]> {
    return this.chatbotQueriesService.findByUser(userId);
  }
}
