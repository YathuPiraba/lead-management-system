import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from './jwt-token.service';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import { UserInterface } from './interfaces/user.interface';
import { Response } from 'express';
import { UserType } from '../user/entities/roles.entity';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtTokenService: JwtTokenService,
    private userService: UserService,
    private redisService: RedisService,
  ) {}
  async hashPassword(plainPassword: string): Promise<string> {
    return await argon2.hash(plainPassword);
  }

  async verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
    return await argon2.verify(hash, plainPassword);
  }

  async login(
    username: string,
    password: string,
    res: Response,
  ): Promise<{ message: string }> {
    const user = await this.userService.findByUsername(username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await this.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Build payload
    const payload: UserInterface = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roleId: Number(user.role.id),
      orgId: user?.orgId,
      type: user.role.name as UserType,
    };

    const accessToken = this.jwtTokenService.generateAccessToken(payload);
    const refreshToken = this.jwtTokenService.generateRefreshToken(payload);

    this.jwtTokenService.setAccessTokenCookie(res, accessToken);
    this.jwtTokenService.setRefreshTokenCookie(res, refreshToken);
    this.redisService.storeRefreshToken(
      user.role.name as UserType,
      user.id,
      refreshToken,
    );

    return { message: 'Login successful' };
  }
}
