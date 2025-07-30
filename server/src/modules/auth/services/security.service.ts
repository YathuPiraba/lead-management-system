import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../redis/redis.service';
import { UserInterface } from '../interfaces/user.interface';
import { UserType } from '../../user/entities/roles.entity';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Check for suspicious login activities
   */
  async checkSuspiciousActivity(
    user: UserInterface,
    deviceFingerprint?: string,
    ip?: string,
  ): Promise<{ isSuspicious: boolean; reasons: string[] }> {
    try {
      const sessions = await this.redisService.getUserSessions(
        user.type,
        user.userId,
      );
      const reasons: string[] = [];
      let isSuspicious = false;

      // Check for too many concurrent sessions
      if (sessions.length > 10) {
        isSuspicious = true;
        reasons.push('Too many concurrent sessions');
      }

      // Check for different device fingerprints
      if (deviceFingerprint) {
        const differentDevices = sessions.filter(
          (s) =>
            s.deviceFingerprint && s.deviceFingerprint !== deviceFingerprint,
        );
        if (differentDevices.length > 5) {
          isSuspicious = true;
          reasons.push('Login from multiple devices');
        }
      }

      // Check for different IP addresses
      if (ip) {
        const differentIPs = new Set(
          sessions.filter((s) => s.ip && s.ip !== ip).map((s) => s.ip),
        );
        if (differentIPs.size > 3) {
          isSuspicious = true;
          reasons.push('Login from multiple IP addresses');
        }
      }

      return { isSuspicious, reasons };
    } catch (error) {
      this.logger.error(
        `Failed to check suspicious activity for user ${user.userId}:`,
        error,
      );
      return { isSuspicious: false, reasons: [] };
    }
  }

  /**
   * Force logout user from all devices (admin action)
   */
  async forceLogoutUser(
    targetUserId: string,
    targetUserType: UserType,
    adminUserId: string,
    reason: string = 'admin_action',
  ): Promise<{ message: string; loggedOutCount: number }> {
    try {
      const sessionCount = await this.redisService.getUserSessionCount(
        targetUserType,
        targetUserId,
      );

      await this.redisService.removeAllRefreshTokensForUser(
        targetUserType,
        targetUserId,
      );

      this.logger.warn(
        `Admin ${adminUserId} forced logout of user ${targetUserId}. ${sessionCount} sessions terminated. Reason: ${reason}`,
      );

      return {
        message: 'User forcefully logged out from all devices',
        loggedOutCount: sessionCount,
      };
    } catch (error) {
      this.logger.error(`Failed to force logout user ${targetUserId}:`, error);
      throw error;
    }
  }
}
