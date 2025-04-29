import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CareerSuggestionModule } from './career_suggestion/career_suggestion.module';
import { AiModule } from './ai/ai.module';
import { ResumeAnalysisModule } from './resume-analysis/resume-analysis.module';
import { ChatbotQueriesModule } from './chatbot-query/chatbot-query.module';
import { CourseController } from './course/course.controller';
import { CoursesModule } from './course/course.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from './redis/redis.module';
@Module({
  imports: [
    RedisModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),

    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }), //loads env files automatically
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    CareerSuggestionModule,
    AiModule,
    ResumeAnalysisModule,
    ChatbotQueriesModule,
    CoursesModule,
    FeedbackModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
