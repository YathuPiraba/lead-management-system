import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '../../../redis/redis.service';
import { JwtTokenService } from '../services/jwt-token.service';
import {
  RefreshTokenPayload,
  UserInterface,
} from '../interfaces/user.interface';
import { SessionInfo } from '../dto/session/session-info.dto';
import { SessionStatsDto } from '../dto/session/session-stats.dto';
import { LogoutSessionDto } from '../dto/session/logout-session.dto';
import { SessionActivityService } from './session-activity.service';

@Injectable()
export class SessionManagementService {
  private readonly logger = new Logger(SessionManagementService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionActivityService: SessionActivityService,
  ) {}

  async getCurrentUserSessions(
    user: UserInterface,
    currentTokenId?: string,
  ): Promise<SessionInfo[]> {
    try {
      const sessions = await this.redisService.getUserSessions(
        user.type,
        user.userId,
      );

      const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
          const activity = await this.sessionActivityService.getSessionActivity(
            user.type,
            user.userId,
            session.tokenId,
          );

          return {
            ...session,
            isCurrent: session.tokenId === currentTokenId,
            lastActivity: activity?.lastActivity
              ? new Date(activity.lastActivity).toISOString()
              : session.createdAt,
          };
        }),
      );

      return enrichedSessions;
    } catch (error) {
      this.logger.error(
        `Failed to get sessions for user ${user.userId}:`,
        error,
      );
      throw error;
    }
  }

  async getUserSessionStats(user: UserInterface): Promise<SessionStatsDto> {
    try {
      const sessions = await this.redisService.getUserSessions(
        user.type,
        user.userId,
      );

      const deviceBreakdown: Record<string, number> = {};
      const locationBreakdown: Record<string, number> = {};

      sessions.forEach((session) => {
        const device = this.extractDeviceType(session.userAgent);
        deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;

        const location = session.ip || 'Unknown';
        locationBreakdown[location] = (locationBreakdown[location] || 0) + 1;
      });

      return {
        totalSessions: sessions.length,
        activeSessions: sessions.length,
        deviceBreakdown,
        locationBreakdown,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get session stats for user ${user.userId}:`,
        error,
      );
      throw error;
    }
  }

  async logoutSpecificSession(
    user: UserInterface,
    logoutDto: LogoutSessionDto,
  ): Promise<{ message: string }> {
    try {
      await this.redisService.logoutSpecificSession(
        user.type,
        user.userId,
        logoutDto.tokenId,
      );

      this.logger.log(
        `Session ${logoutDto.tokenId} logged out for user ${user.userId}. Reason: ${logoutDto.reason || 'user_initiated'}`,
      );

      return { message: 'Session logged out successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to logout session ${logoutDto.tokenId} for user ${user.userId}:`,
        error,
      );
      throw error;
    }
  }

  async logoutOtherSessions(
    user: UserInterface,
    currentTokenId: string,
    reason: string = 'user_initiated',
  ): Promise<{ message: string; loggedOutCount: number }> {
    try {
      const sessionsBefore = await this.redisService.getUserSessionCount(
        user.type,
        user.userId,
      );

      await this.redisService.logoutAllOtherSessions(
        user.type,
        user.userId,
        currentTokenId,
      );

      const sessionsAfter = await this.redisService.getUserSessionCount(
        user.type,
        user.userId,
      );
      const loggedOutCount = sessionsBefore - sessionsAfter;

      this.logger.log(
        `${loggedOutCount} other sessions logged out for user ${user.userId}. Reason: ${reason}`,
      );

      return {
        message: 'All other sessions logged out successfully',
        loggedOutCount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to logout other sessions for user ${user.userId}:`,
        error,
      );
      throw error;
    }
  }

  async logoutAllSessions(
    user: UserInterface,
    reason: string = 'user_initiated',
  ): Promise<{ message: string; loggedOutCount: number }> {
    try {
      const sessionsBefore = await this.redisService.getUserSessionCount(
        user.type,
        user.userId,
      );

      await this.redisService.removeAllRefreshTokensForUser(
        user.type,
        user.userId,
      );

      this.logger.log(
        `All ${sessionsBefore} sessions logged out for user ${user.userId}. Reason: ${reason}`,
      );

      return {
        message: 'All sessions logged out successfully',
        loggedOutCount: sessionsBefore,
      };
    } catch (error) {
      this.logger.error(
        `Failed to logout all sessions for user ${user.userId}:`,
        error,
      );
      throw error;
    }
  }

  async validateSessionOwnership(
    user: UserInterface,
    tokenId: string,
  ): Promise<boolean> {
    try {
      const tokenData = await this.redisService.getRefreshTokenWithMeta(
        user.type,
        user.userId,
        tokenId,
      );

      return tokenData !== null;
    } catch (error) {
      this.logger.error(
        `Failed to validate session ownership for user ${user.userId}:`,
        error,
      );
      return false;
    }
  }

  async getCurrentSessionInfo(req: Request): Promise<SessionInfo | null> {
    try {
      const token = req.cookies?.refresh_token;
      if (!token) return null;

      const payload: RefreshTokenPayload =
        this.jwtTokenService.verifyRefreshToken(token);
      const tokenData = await this.redisService.getRefreshTokenWithMeta(
        payload.type,
        payload.userId,
        payload.tokenId,
      );

      if (!tokenData) return null;

      return {
        tokenId: payload.tokenId,
        deviceFingerprint: tokenData.deviceFingerprint,
        userAgent: tokenData.userAgent,
        createdAt: tokenData.createdAt,
        ip: tokenData.ip || '',
        isCurrent: true,
      };
    } catch (error) {
      this.logger.error('Failed to get current session info:', error);
      return null;
    }
  }

  private extractDeviceType(userAgent: string): string {
    if (!userAgent) return 'Unknown';

    const ua = userAgent.toLowerCase();

    if (
      ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone')
    ) {
      return 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    } else if (ua.includes('chrome')) {
      return 'Chrome Desktop';
    } else if (ua.includes('firefox')) {
      return 'Firefox Desktop';
    } else if (ua.includes('safari')) {
      return 'Safari Desktop';
    } else if (ua.includes('edge')) {
      return 'Edge Desktop';
    } else {
      return 'Desktop';
    }
  }
}
