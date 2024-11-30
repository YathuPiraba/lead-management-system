import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if endpoint is public
    const isPublic =
      this.reflector.get<boolean>('isPublic', context.getHandler()) ||
      this.reflector.get<boolean>('isPublic', context.getClass());

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify token manually to handle expiration
      const payload = this.jwtService.verify(token);

      // Attach user to request
      request.user = payload;

      return super.canActivate(context);
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  // Handle validation errors from passport-jwt
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(info?.message || 'Authentication failed')
      );
    }
    return user;
  }
}
