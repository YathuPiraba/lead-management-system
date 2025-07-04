import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Role } from './entities/roles.entity';
import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [TypeOrmModule],
})
export class AuthModule {}
