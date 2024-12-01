import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

interface StoredToken {
  token: string;
  createdAt: string;
}

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const redisKey = `refresh_token:${payload.sub}`;
      const storedToken = await this.redisService.get(redisKey);

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      // Ensure storedToken is a string before attempting to parse or compare
      if (typeof storedToken !== 'string') {
        throw new UnauthorizedException('Invalid token format in storage');
      }

      let actualToken: string;
      try {
        const parsedToken = JSON.parse(storedToken) as StoredToken;
        actualToken = parsedToken.token;
      } catch {
        // If parsing fails, assume it's a plain string token
        actualToken = storedToken;
      }

      if (actualToken !== refreshToken) {
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
      if (error instanceof SyntaxError) {
        throw new UnauthorizedException('Invalid token format');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async storeRefreshToken(userId: number, refreshToken: string) {
    const tokenData: StoredToken = {
      token: refreshToken,
      createdAt: new Date().toISOString(),
    };

    // Using set with expiration time as a number (seconds)
    await this.redisService.set(
      `refresh_token:${userId}`,
      JSON.stringify(tokenData),
      7 * 24 * 60 * 60,
    );
  }

  async invalidateRefreshToken(userId: number) {
    await this.redisService.del(`refresh_token:${userId}`);
  }
}
