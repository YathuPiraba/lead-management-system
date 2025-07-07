import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { USER_NOT_FOUND } from '../../../common/constants/error.constants';
import { User } from '../../user/entities/users.entity';
import { UserInterface } from '../interfaces/user.interface';

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

  async validate(payload: UserInterface): Promise<User> {
    let relations: string[] = [];

    switch (payload.type) {
      case 'product_admin':
        relations = ['role'];
        break;
      case 'org_admin':
      case 'org_staff':
        relations = ['role', 'organization'];
        break;
      default:
        throw new UnauthorizedException('Invalid user type in token.');
    }

    const user = await this.userRepository.findOne({
      where: { id: String(payload.userId) },
      relations,
    });

    if (!user) {
      throw new UnauthorizedException(USER_NOT_FOUND);
    }

    return user;
  }
}
