import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Role } from './entities/roles.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class UserModule {}
