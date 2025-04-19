import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { CreateChatbotQueryDto } from './dto/create-chatbot-query.dto';
import { ChatbotQuery } from './schemas/chatbot-query.schema';
import { ChatbotQueriesService } from './chatbot-query.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guard';
import { RoleGuards } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/users/schemas/user.schema';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuards)
@Controller('chatbot-queries')
export class ChatbotQueriesController {
  constructor(private readonly chatbotQueriesService: ChatbotQueriesService) {}

  @Roles(
    UserRole.USER,
    UserRole.EXPERT,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
    UserRole.GUEST,
  )
  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() createChatbotQueryDto: CreateChatbotQueryDto,
  ): Promise<ChatbotQuery> {
    const { question } = createChatbotQueryDto;
    return this.chatbotQueriesService.create(userId, question);
  }

  @Roles(UserRole.USER, UserRole.EXPERT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get(':userId')
  async findByUser(@Param('userId') userId: string): Promise<ChatbotQuery[]> {
    return this.chatbotQueriesService.findByUser(userId);
  }
}
