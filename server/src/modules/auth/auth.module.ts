import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
