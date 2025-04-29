import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
    RedisModule,
  ],
  providers: [FeedbackService],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
