import { Module } from '@nestjs/common';
import { RedisService } from './redis.provider';

@Module({
  providers: [RedisService],
  exports: [RedisService], // Export to use in other parts of your app
})
export class RedisModule {}
