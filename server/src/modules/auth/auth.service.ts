import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from './jwt-token.service';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import {
  RefreshTokenPayload,
  UserInterface,
} from './interfaces/user.interface';
import { Request, Response } from 'express';
import { UserType } from '../user/entities/roles.entity';
import { RedisService } from '../../redis/redis.service';
import { UserResponseDto } from './dto/user-response.dto';

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
    const { refreshToken, tokenId } =
      this.jwtTokenService.generateRefreshToken(payload);

    this.jwtTokenService.setAccessTokenCookie(res, accessToken);
    this.jwtTokenService.setRefreshTokenCookie(res, refreshToken);
    this.redisService.storeRefreshToken(
      user.role.name as UserType,
      user.id,
      refreshToken,
      tokenId,
    );

    return { message: 'Login successful' };
  }

  async getUserDetails(user: UserInterface): Promise<UserResponseDto> {
    const fullUser = await this.userService.findById(user.userId);

    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: fullUser.id,
      username: fullUser.username,
      email: fullUser.email,
      roleId: Number(fullUser.role.id),
      orgId: fullUser.orgId,
      type: fullUser.role.name as UserType,
      isFirstLogin: fullUser.isFirstLogin,
      imageUrl: fullUser.imageUrl,
    };
  }

  async refreshTokens(
    req: Request,
    res: Response,
  ): Promise<{ message: string }> {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('No refresh token provided');

    // Decode without verifying to extract tokenId
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtTokenService.verifyRefreshToken(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { userId, type, tokenId } = payload;
    const storedToken = await this.redisService.getRefreshToken(
      type,
      userId,
      tokenId,
    );
    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedException('Refresh token not found or mismatched');
    }

    // Fetch user
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    // Build payload again
    const userPayload: UserInterface = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roleId: Number(user.role.id),
      orgId: user.orgId,
      type: user.role.name as UserType,
    };

    // Issue new tokens
    const accessToken = this.jwtTokenService.generateAccessToken(userPayload);
    const { refreshToken: newRefreshToken, tokenId: newTokenId } =
      this.jwtTokenService.generateRefreshToken(userPayload);

    // Store new token in Redis
    await this.redisService.storeRefreshToken(
      userPayload.type,
      userPayload.userId,
      newTokenId,
      newRefreshToken,
    );

    // Delete old token
    await this.redisService.removeRefreshToken(type, userId, tokenId);

    // Set new cookies
    this.jwtTokenService.setAccessTokenCookie(res, accessToken);
    this.jwtTokenService.setRefreshTokenCookie(res, newRefreshToken);

    return { message: 'Token refreshed successfully' };
  }

  async logout(req: Request, res: Response): Promise<{ message: string }> {
    const token = req.cookies?.refresh_token;
    if (!token) return { message: 'Already logged out' };

    try {
      const payload = this.jwtTokenService.verifyRefreshToken(token);
      const { userId, type, tokenId } = payload;

      await this.redisService.removeRefreshToken(type, userId, tokenId);
    } catch (e) {
      // optional: log error
      console.log('error', e);
    }

    this.jwtTokenService.clearAccessTokenCookie(res);
    this.jwtTokenService.clearRefreshTokenCookie(res);

    return { message: 'Logged out successfully' };
  }
}
