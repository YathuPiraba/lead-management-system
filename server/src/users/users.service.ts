import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from './role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
    image?: Express.Multer.File,
  ): Promise<User> {
    const { password, ...restUserData } = createUserDto;

    // Hash the password
    const hashedPassword = await argon2.hash(password);

    const roleId = 2;

    // Find the role
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Prepare base user data
    let userData = {
      ...restUserData,
      password: hashedPassword,
      role: role,
    };

    // Handle image upload if provided
    if (image) {
      const uploadedImage = await this.cloudinaryService.uploadImage(image);
      userData = {
        ...userData,
        image: uploadedImage.secure_url,
      };
    }

    // Create and save the new user
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ): Promise<User> {
    // Find the existing user
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const oldImageUrl = user.image;

    // Update fields if provided
    if (updateUserDto.userName) {
      user.userName = updateUserDto.userName;
    }

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      user.password = await argon2.hash(updateUserDto.password);
    }

    // Handle image upload if provided
    if (image) {
      // Delete the old image if it exists
      if (oldImageUrl) {
        try {
          await this.cloudinaryService.deleteImage(oldImageUrl);
        } catch (error) {
          console.error('Failed to delete old image:', error);
        }
      }

      // Upload the new image
      const uploadedImage = await this.cloudinaryService.uploadImage(image);
      // Update user with new image URL
      await this.cloudinaryService.uploadImage(image);
      // Update user with new image URL
      user.image = uploadedImage.secure_url;
    }

    // Save the updated user
    return this.userRepository.save(user);
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userName, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { userName } });

    if (!user || !(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      // Generate tokens with payload only
      const payload = { id: user.id, userName: user.userName };

      // Get access token
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('SECRET_KEY'),
        expiresIn: '15m',
      });

      // Get refresh token
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('SECRET_KEY'),
        expiresIn: '7d',
      });
      // Store refresh token in Redis
      await this.redis.set(
        user.id.toString(),
        refreshToken,
        'EX',
        7 * 24 * 60 * 60,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Token generation error:', error);
      throw new InternalServerErrorException('Error generating tokens');
    }
  }
}
