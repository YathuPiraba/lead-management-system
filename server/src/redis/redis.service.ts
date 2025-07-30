import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  REDIS_CLIENT,
  REDIS_KEY_PREFIX,
  REFRESH_TOKEN_KEY,
  REFRESH_TOKEN_TTL,
} from './constants/redis.constants';
import {
  RedisClient,
  RefreshTokenData,
  Session,
} from './interfaces/redis-client.interface';
import { UserType } from '../modules/user/entities/roles.entity';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  /**
   * Generate consistent Redis key for refresh tokens
   */
  private getRefreshTokenKey(
    userType: UserType,
    userId: string,
    tokenId: string,
  ): string {
    return `${REDIS_KEY_PREFIX}:${REFRESH_TOKEN_KEY}:${userType}:${userId}:${tokenId}`;
  }

  /**
   * Generate meta key for refresh token metadata
   */
  private getMetaKey(key: string): string {
    return `${key}:meta`;
  }

  /**
   * Generate pattern for user's refresh tokens
   */
  private getUserTokenPattern(userType: UserType, userId: string): string {
    return `${REDIS_KEY_PREFIX}:${REFRESH_TOKEN_KEY}:${userType}:${userId}:*`;
  }

  async storeRefreshToken(
    userType: UserType,
    userId: string,
    refreshToken: string,
    tokenId: string,
    deviceFingerprint?: string,
    userAgent: string = '',
    ip?: string,
    expiresIn: number = REFRESH_TOKEN_TTL,
  ): Promise<void> {
    const key = this.getRefreshTokenKey(userType, userId, tokenId);
    const metaKey = this.getMetaKey(key);

    try {
      // Use pipeline for atomic operations
      const pipeline = this.redisClient.pipeline();

      // Store refresh token
      pipeline.set(key, refreshToken, 'EX', expiresIn);

      // Store metadata
      const metaData: Record<string, string> = {
        createdAt: Date.now().toString(),
        userAgent,
        ...(deviceFingerprint && { deviceFingerprint }),
        ...(ip && { ip }),
      };

      pipeline.hmset(metaKey, metaData);
      pipeline.expire(metaKey, expiresIn);

      await pipeline.exec();

      this.logger.debug(
        `Stored refresh token for user ${userId} with tokenId ${tokenId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to store refresh token for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieve refresh token by userType, userId and tokenId
   */
  async getRefreshToken(
    userType: UserType,
    userId: string,
    tokenId: string,
  ): Promise<string | null> {
    try {
      const key = this.getRefreshTokenKey(userType, userId, tokenId);
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(
        `Failed to get refresh token for user ${userId}:`,
        error,
      );
      return null;
    }
  }

  async getRefreshTokenWithMeta(
    userType: UserType,
    userId: string,
    tokenId: string,
  ): Promise<RefreshTokenData | null> {
    try {
      const key = this.getRefreshTokenKey(userType, userId, tokenId);
      const metaKey = this.getMetaKey(key);

      const [token, meta] = await Promise.all([
        this.redisClient.get(key),
        this.redisClient.hgetall(metaKey),
      ]);

      if (!token) {
        return null;
      }

      return {
        token,
        deviceFingerprint: meta?.deviceFingerprint,
        userAgent: meta?.userAgent || '',
        createdAt: meta?.createdAt || '',
        ip: meta?.ip,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get refresh token with meta for user ${userId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Remove a specific refresh token
   */
  async removeRefreshToken(
    userType: UserType,
    userId: string,
    tokenId: string,
  ): Promise<void> {
    try {
      const key = this.getRefreshTokenKey(userType, userId, tokenId);
      const metaKey = this.getMetaKey(key);

      const deletedCount = await this.redisClient.del(key, metaKey);

      if (deletedCount > 0) {
        this.logger.debug(
          `Removed refresh token for user ${userId} with tokenId ${tokenId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to remove refresh token for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async removeAllRefreshTokensForUser(
    userType: UserType,
    userId: string,
  ): Promise<void> {
    try {
      const pattern = this.getUserTokenPattern(userType, userId);
      const keys = await this.redisClient.keys(pattern);

      if (keys.length > 0) {
        // Use pipeline for batch deletion
        const pipeline = this.redisClient.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();

        this.logger.debug(
          `Removed ${keys.length} refresh tokens for user ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to remove all refresh tokens for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get all active sessions for a user with improved performance
   */
  async getUserSessions(
    userType: UserType,
    userId: string,
  ): Promise<Session[]> {
    try {
      const pattern = this.getUserTokenPattern(userType, userId);
      const keys = await this.redisClient.keys(pattern);

      // Filter out meta keys and get token keys only
      const tokenKeys = keys.filter((key) => !key.endsWith(':meta'));

      if (tokenKeys.length === 0) {
        return [];
      }

      // Batch fetch all metadata using pipeline
      const pipeline = this.redisClient.pipeline();
      tokenKeys.forEach((key) => {
        const metaKey = this.getMetaKey(key);
        pipeline.hgetall(metaKey);
      });

      const results = await pipeline.exec();
      const sessions: Session[] = [];

      tokenKeys.forEach((key, index) => {
        const tokenId = key.split(':').pop();
        if (!tokenId) return;

        const metaResult = results?.[index];
        if (metaResult && metaResult[0] === null) {
          // No error
          const meta = metaResult[1] as Record<string, string>;
          if (meta && Object.keys(meta).length > 0) {
            sessions.push({
              tokenId,
              deviceFingerprint: meta.deviceFingerprint,
              userAgent: meta.userAgent || '',
              createdAt: meta.createdAt || '',
              ip: meta.ip || '',
            });
          }
        }
      });

      return sessions;
    } catch (error) {
      this.logger.error(
        `Failed to get user sessions for user ${userId}:`,
        error,
      );
      return [];
    }
  }

  async logoutAllOtherSessions(
    userType: UserType,
    userId: string,
    currentTokenId: string,
  ): Promise<void> {
    try {
      const pattern = this.getUserTokenPattern(userType, userId);
      const keys = await this.redisClient.keys(pattern);

      const keysToDelete = keys.filter((key) => {
        if (key.endsWith(':meta')) return false;
        const tokenId = key.split(':').pop();
        return tokenId !== currentTokenId;
      });

      if (keysToDelete.length > 0) {
        const metaKeysToDelete = keysToDelete.map((key) =>
          this.getMetaKey(key),
        );
        const allKeysToDelete = [...keysToDelete, ...metaKeysToDelete];

        // Use pipeline for batch deletion
        const pipeline = this.redisClient.pipeline();
        allKeysToDelete.forEach((key) => pipeline.del(key));
        await pipeline.exec();

        this.logger.debug(
          `Logged out ${keysToDelete.length} other sessions for user ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to logout other sessions for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async logoutSpecificSession(
    userType: UserType,
    userId: string,
    tokenId: string,
  ): Promise<void> {
    try {
      const key = this.getRefreshTokenKey(userType, userId, tokenId);
      const metaKey = this.getMetaKey(key);

      const deletedCount = await this.redisClient.del(key, metaKey);

      if (deletedCount > 0) {
        this.logger.debug(`Logged out session ${tokenId} for user ${userId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to logout session ${tokenId} for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Health check method to verify Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redisClient.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get count of active sessions for a user
   */
  async getUserSessionCount(
    userType: UserType,
    userId: string,
  ): Promise<number> {
    try {
      const pattern = this.getUserTokenPattern(userType, userId);
      const keys = await this.redisClient.keys(pattern);
      return keys.filter((key) => !key.endsWith(':meta')).length;
    } catch (error) {
      this.logger.error(
        `Failed to get session count for user ${userId}:`,
        error,
      );
      return 0;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      this.logger.warn('Closing Redis connection...');
      await this.redisClient.quit();
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }
}
