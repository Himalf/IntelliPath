import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChatbotQuery,
  ChatbotQuerySchema,
} from './schemas/chatbot-query.schema';
import { AiModule } from 'src/ai/ai.module';
import { ChatbotQueriesController } from './chatbot-query.controller';
import { ChatbotQueriesService } from './chatbot-query.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatbotQuery.name, schema: ChatbotQuerySchema },
    ]),
    AiModule,
    UsersModule,
  ],
  controllers: [ChatbotQueriesController],
  providers: [ChatbotQueriesService],
})
export class ChatbotQueriesModule {}
