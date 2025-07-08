import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  REDIS_CLIENT,
  REDIS_KEY_PREFIX,
  REFRESH_TOKEN_KEY,
  REFRESH_TOKEN_TTL,
} from './constants/redis.constants';
import { RedisClient } from './interfaces/redis-client.interface';
import { UserType } from '../modules/user/entities/roles.entity';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  async storeRefreshToken(
    userType: UserType,
    userId: string,
    refreshToken: string,
    tokenId: string,
    expiresIn: number = REFRESH_TOKEN_TTL,
  ): Promise<void> {
    const key = `${REDIS_KEY_PREFIX}:${REFRESH_TOKEN_KEY}:${userType}:${userId}:${tokenId}`;

    await this.redisClient.set(key, refreshToken, 'EX', expiresIn);

    const metaKey = `${key}:meta`;
    await this.redisClient.hmset(metaKey, {
      createdAt: Date.now().toString(),
      userAgent: '',
      ip: '',
    });

    await this.redisClient.expire(metaKey, expiresIn);
  }

  /**
   * Retrieve refresh token by userType, userId and tokenId
   */
  async getRefreshToken(
    userType: UserType,
    userId: string,
    tokenId: string,
  ): Promise<string | null> {
    const key = `${REDIS_KEY_PREFIX}:${REFRESH_TOKEN_KEY}:${userType}:${userId}:${tokenId}`;
    return this.redisClient.get(key);
  }

  /**
   * Remove a specific refresh token
   * @param userType Type of user
   * @param userId The user's ID
   * @param tokenId Token identifier
   */
  async removeRefreshToken(
    userType: UserType,
    userId: string,
    tokenId: string,
  ): Promise<void> {
    const key = `${REDIS_KEY_PREFIX}:${REFRESH_TOKEN_KEY}:${userType}:${userId}:${tokenId}`;
    const metaKey = `${key}:meta`;

    await this.redisClient.del(key, metaKey);
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.warn('Closing Redis connection...');
    await this.redisClient.quit();
  }
}
