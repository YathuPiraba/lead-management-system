import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Role } from './entities/roles.entity';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), RedisModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule, RedisModule],
})
export class UserModule {}
