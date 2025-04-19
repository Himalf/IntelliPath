import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai/ai.service';
import { HttpModule } from '@nestjs/axios';
import { CareerSuggestionService } from './career_suggestion/career_suggestion.service';
import { CareerSuggestionController } from './career_suggestion/career_suggestion.controller';
import { CareerSuggestionModule } from './career_suggestion/career_suggestion.module';
import { AiModule } from './ai/ai.module';
@Module({
  imports: [
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
  ],
})
export class AppModule {}
