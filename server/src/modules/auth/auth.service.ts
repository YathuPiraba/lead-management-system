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
import { OrganizationService } from '../organization/services/organization.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtTokenService: JwtTokenService,
    private userService: UserService,
    private redisService: RedisService,
    private organizationService: OrganizationService,
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
    subdomain: string | undefined,
    res: Response,
    req: Request,
  ): Promise<{ message: string }> {
    const user = await this.userService.findByUsername(username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await this.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.orgId) {
      if (!subdomain) {
        throw new UnauthorizedException('Subdomain required for tenant login');
      }
      const org = await this.organizationService.findOrgBySubdomain(subdomain);
      if (!org) {
        throw new UnauthorizedException('Invalid organization subdomain');
      }
      if (user.orgId !== org.id) {
        throw new UnauthorizedException('Organization mismatch');
      }
    } else {
      // Product admin: no orgId, subdomain must be empty or undefined
      if (subdomain) {
        throw new UnauthorizedException(
          'Product admin login should not have subdomain',
        );
      }
    }

    const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
    const userAgent = req.headers['user-agent'] || '';
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip = Array.isArray(rawIp)
      ? rawIp[0]
      : rawIp?.toString().split(',')[0]?.trim();

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
    await this.redisService.storeRefreshToken(
      user.role.name as UserType,
      user.id,
      refreshToken,
      tokenId,
      deviceFingerprint,
      userAgent,
      ip,
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
      roleId: fullUser.role.id,
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

    const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
    const userAgent = req.headers['user-agent'] || '';

    // Decode without verifying to extract tokenId
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtTokenService.verifyRefreshToken(token);
    } catch (err) {
      console.error('Refresh token verification failed:', err);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { userId, type, tokenId } = payload;
    const tokenData = await this.redisService.getRefreshTokenWithMeta(
      type,
      userId,
      tokenId,
    );
    if (!tokenData || tokenData.token !== token) {
      throw new UnauthorizedException('Refresh token not found or mismatched');
    }

    // Verify device fingerprint matches
    if (
      tokenData.deviceFingerprint &&
      deviceFingerprint !== tokenData.deviceFingerprint
    ) {
      // Invalidate the token if device fingerprint doesn't match
      await this.redisService.removeRefreshToken(type, userId, tokenId);
      throw new UnauthorizedException('Device mismatch - please login again');
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

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip = Array.isArray(rawIp)
      ? rawIp[0]
      : rawIp?.toString().split(',')[0]?.trim();

    // Store new token in Redis
    await this.redisService.storeRefreshToken(
      userPayload.type,
      userPayload.userId,
      newRefreshToken,
      newTokenId,
      deviceFingerprint,
      userAgent,
      ip,
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
