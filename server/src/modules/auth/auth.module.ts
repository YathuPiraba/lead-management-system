import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [UserModule, OrganizationModule],
  providers: [AuthService, JwtStrategy, JwtService, JwtTokenService],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
