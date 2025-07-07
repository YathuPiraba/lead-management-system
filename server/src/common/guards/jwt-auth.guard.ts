import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  TOKEN_EXPIRED,
  INVALID_TOKEN,
  NO_TOKEN_PROVIDED,
  AUTHENTICATION_FAILED,
} from '../constants/error.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const contextType = context.getType();
    if (contextType !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(NO_TOKEN_PROVIDED);
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      request.user = payload;
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: 'Token has expired',
          code: TOKEN_EXPIRED,
        });
      }

      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          message: 'Invalid token',
          code: INVALID_TOKEN,
        });
      }

      throw new UnauthorizedException(AUTHENTICATION_FAILED);
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err || new UnauthorizedException(info?.message || AUTHENTICATION_FAILED)
      );
    }
    return user;
  }

  private extractToken(request: Request): string | undefined {
    // 1. Try from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer') return token;
    }

    // 2. Fallback to HTTP-only cookie (for web clients)
    if (request.cookies?.access_token) {
      return request.cookies.access_token;
    }

    return undefined;
  }
}
