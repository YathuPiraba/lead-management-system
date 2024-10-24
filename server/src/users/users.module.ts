import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { User } from './user.entity';
import { Role } from './role.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    CloudinaryModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Use a secret key from environment variables
      signOptions: { expiresIn: '15m' }, // You can customize this
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
