import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { USER_NOT_FOUND } from '../../../common/constants/error.constants';
import { User } from '../../user/entities/users.entity';
import { UserType } from '../../../common/types/express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractTokenFromHeaderOrCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  private static extractTokenFromHeaderOrCookie(req: Request): string | null {
    // Try Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    // Fallback: Try cookie
    if (req.cookies?.access_token) {
      return req.cookies.access_token;
    }

    return null;
  }

  async validate(payload: {
    userId: number;
    email: string;
    roleId?: number;
    orgId?: number;
    type: UserType;
  }): Promise<User> {
    if (payload.type === 'product_admin') {
      const user = await this.userRepository.findOne({
        where: { id: String(payload.userId) },
        relations: ['role'],
      });

      if (!user) throw new UnauthorizedException(USER_NOT_FOUND);
      return user;
    } else if (payload.type === 'org_admin' || payload.type === 'org_staff') {
      const user = await this.userRepository.findOne({
        where: { id: String(payload.userId) },
        relations: ['role', 'organization'],
      });

      if (!user) throw new UnauthorizedException(USER_NOT_FOUND);
      return user;
    }

    throw new UnauthorizedException('Invalid user type in token.');
  }
}
