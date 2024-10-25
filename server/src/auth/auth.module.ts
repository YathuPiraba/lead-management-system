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

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    UsersModule,
  ],
  providers: [JwtStrategy, EmailService, PasswordResetService],
  controllers: [PasswordResetController],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
