import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService, // Inject RedisService instead of Redis
    private configService: ConfigService,
  ) {}

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.redisService.get(
        `refresh_token:${payload.sub}`,
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          username: payload.username,
          isFirstLogin: payload.isFirstLogin,
        },
        {
          expiresIn: '15m',
          secret: this.configService.get('JWT_ACCESS_SECRET'),
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async invalidateRefreshToken(userId: number) {
    await this.redisService.del(`refresh_token:${userId}`);
  }
}
