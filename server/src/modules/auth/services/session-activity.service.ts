import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../redis/redis.service';
import { UserType } from '../../user/entities/roles.entity';

@Injectable()
export class SessionActivityService {
  private readonly logger = new Logger(SessionActivityService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Track session activity (could be called on each authenticated request)
   */
  async trackActivity(
    userType: UserType,
    userId: string,
    tokenId: string,
    activity: string = 'api_call',
  ): Promise<void> {
    try {
      // Store last activity timestamp
      const activityKey = `${userType}:${userId}:${tokenId}:activity`;
      await this.redisService['redisClient'].set(
        activityKey,
        JSON.stringify({
          lastActivity: Date.now(),
          activity,
        }),
        'EX',
        3600,
      );
    } catch (error) {
      this.logger.error(
        `Failed to track activity for session ${tokenId}:`,
        error,
      );
      // Don't throw error as this is tracking functionality
    }
  }

  /**
   * Get session activity history
   */
  async getSessionActivity(
    userType: UserType,
    userId: string,
    tokenId: string,
  ): Promise<{ lastActivity: number; activity: string } | null> {
    try {
      const activityKey = `${userType}:${userId}:${tokenId}:activity`;
      const data = await this.redisService['redisClient'].get(activityKey);

      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(
        `Failed to get activity for session ${tokenId}:`,
        error,
      );
      return null;
    }
  }
}
