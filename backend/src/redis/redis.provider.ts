import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisType } from 'ioredis';

@Injectable()
export class RedisService {
  private redis: RedisType;

  constructor() {
    // Set your Redis Upstash credentials here
    const redisUrl =
      process.env.REDIS_URL ||
      'rediss://default:ARV3AAIjcDE3OWNjZjA0Zjg1NDc0MjljOWJiM2U2MGNmMjdhOGRkZXAxMA@destined-hound-5495.upstash.io:6379';

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

  // Delete a key from Redis cache
  async deleteCache(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Optionally, you can close the Redis connection when your app stops
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
