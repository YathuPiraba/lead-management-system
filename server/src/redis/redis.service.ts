import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT } from './constants/redis.constants';
import { RedisClient } from './interfaces/redis-client.interface';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    try {
      if (ttlSeconds) {
        return await this.redisClient.set(key, value, 'EX', ttlSeconds);
      }
      return await this.redisClient.set(key, value);
    } catch (error) {
      this.logger.error(`Error setting key "${key}": ${error.message}`);
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Error getting key "${key}": ${error.message}`);
      return null;
    }
  }

  async delete(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key "${key}": ${error.message}`);
      return 0;
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.warn('Closing Redis connection...');
    await this.redisClient.quit();
  }
}
