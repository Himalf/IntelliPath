import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResumeAnalysis,
  ResumeAnalysisSchema,
} from './schemas/resume-analysis.schema';
import { AiModule } from 'src/ai/ai.module';
import { UsersModule } from 'src/users/users.module';
import { ResumeAnalysisService } from './resume-analysis.service';
import { ResumeAnalysisController } from './resume-analysis.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResumeAnalysis.name, schema: ResumeAnalysisSchema },
    ]),
    AiModule,
    UsersModule,
    RedisModule,
  ],
  providers: [ResumeAnalysisService],
  controllers: [ResumeAnalysisController],
})
export class ResumeAnalysisModule {}
