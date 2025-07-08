import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserInterface } from './interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JwtTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(user: UserInterface): string {
    return this.jwtService.sign(user, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  generateRefreshToken(user: UserInterface): {
    refreshToken: string;
    tokenId: string;
  } {
    const tokenId = uuidv4();
    const payload = {
      ...user,
      tokenId,
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return { refreshToken, tokenId };
  }

  setAccessTokenCookie(res: Response, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: this.getSameSite(),
      secure: this.isProduction(),
      maxAge: this.parseToMs(
        this.configService.get<string>('jwt.expiresIn', '1d'),
      ),
    });
  }

  setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      sameSite: this.getSameSite(),
      secure: this.isProduction(),
      maxAge: this.parseToMs(
        this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
      ),
    });
  }

  clearAccessTokenCookie(res: Response): void {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: this.getSameSite(),
      secure: this.isProduction(),
    });
  }

  clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: this.getSameSite(),
      secure: this.isProduction(),
    });
  }

  private getSameSite(): 'lax' | 'strict' | 'none' {
    return this.configService.get<'lax' | 'strict' | 'none'>(
      'COOKIE_SAMESITE',
      'lax',
    );
  }

  private isProduction(): boolean {
    return (
      this.configService.get<string>('NODE_ENV', 'development').trim() ===
      'production'
    );
  }

  private parseToMs(duration: string): number {
    const time = parseInt(duration);
    if (duration.endsWith('d')) return time * 24 * 60 * 60 * 1000;
    if (duration.endsWith('h')) return time * 60 * 60 * 1000;
    if (duration.endsWith('m')) return time * 60 * 1000;
    return time; // fallback (assume ms)
  }
}
