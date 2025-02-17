import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { EmailService } from '../email/email.service';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { Role } from 'src/users/role.entity';
import { UsersService } from 'src/users/users.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TokenService } from './token.service';
import { EnhancedRedisModule } from 'src/redis/redis.module';
import { Staff } from 'src/staff/staff.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');

        if (!secret) {
          throw new Error('JWT secret key is not configured');
        }

        return {
          secret,
          global: true,
          signOptions: {
            expiresIn: '15m',
            algorithm: 'HS256',
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Role, Staff]),
    ConfigModule,
    UsersModule,
    EnhancedRedisModule,
    CloudinaryModule,
  ],
  providers: [
    JwtStrategy,
    EmailService,
    PasswordResetService,
    UsersService,
    TokenService,
  ],
  controllers: [PasswordResetController],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
