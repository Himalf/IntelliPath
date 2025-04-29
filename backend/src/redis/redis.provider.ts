import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisType } from 'ioredis';

@Injectable()
export class RedisService {
  private redis: RedisType;

  constructor() {
    // Set your Redis Upstash credentials here
    const redisUrl =
      process.env.REDIS_URL ||
      'rediss://default:AXd6AAIjcDE0NzVmNTYzZjMyMmY0YzdhYTQ1ZTU1YjJmMDUxNWJkNHAxMA@golden-stag-30586.upstash.io:6379';

    // Connect to Upstash Redis instance
    this.redis = new Redis(redisUrl);
  }

  // You can use this to set a key-value pair in Redis
  async setCache(key: string, value: any, ttlSeconds = 300): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  // You can use this to get a value from Redis by its key
  async getCache<T>(key: string): Promise<T | null> {
    const result = await this.redis.get(key);
    return result ? JSON.parse(result) : null;
  }

  // Optionally, you can close the Redis connection when your app stops
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
