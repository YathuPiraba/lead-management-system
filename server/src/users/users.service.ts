import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  // InternalServerErrorException,
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
import { EmailService } from 'src/email/email.service';
import { generateOneTimePassword } from 'src/utils/generate-password';
import { generateUsername } from 'src/utils/generate-username';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TokenService } from 'src/auth/token.service';

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
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
    image?: Express.Multer.File,
  ): Promise<void> {
    const userName = generateUsername(createUserDto.email);
    const oneTimePassword = generateOneTimePassword();

    // Hash the password
    const hashedPassword = await argon2.hash(oneTimePassword);

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
      ...createUserDto,
      userName,
      password: hashedPassword,
      role: role,
      isFirstLogin: true,
    };
    // Handle image upload if provided
    if (image) {
      const uploadedImage = await this.cloudinaryService.uploadImage(image);
      userData = {
        ...userData,
        image: uploadedImage.secure_url,
      };
    }

    const user = this.userRepository.create(userData);
    await this.userRepository.save(user);

    // Send email with credentials
    await this.emailService.sendStaffCredentials(
      createUserDto.email,
      userName,
      oneTimePassword,
      createUserDto.firstName,
    );
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

  async login(loginDto: LoginDto): Promise<{
    accessToken?: string;
    refreshToken?: string;
    temporaryToken?: string;
    isFirstLogin: boolean;
    message: string;
  }> {
    const user = await this.userRepository.findOne({
      where: [{ userName: loginDto.userName }],
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if it's the first login
    if (user.isFirstLogin) {
      const temporaryPayload = {
        sub: user.id,
        username: user.userName,
        isFirstLogin: true,
      };

      const temporaryToken = this.jwtService.sign(temporaryPayload, {
        expiresIn: '15m',
      });

      return {
        temporaryToken,
        isFirstLogin: true,
        message:
          'Login successful but please change your password for security.',
      };
    }
    // Generate tokens with isFirstLogin in payload
    const payload = {
      sub: user.id,
      username: user.userName,
      isFirstLogin: user.isFirstLogin,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    // Store refresh token in Redis
    await this.tokenService.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      isFirstLogin: user.isFirstLogin,
      message: 'Login successful',
    };
  }

  async generateNewTokens(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload = {
      sub: user.id,
      username: user.userName,
      isFirstLogin: false,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    // Update refresh token in Redis
    await this.tokenService.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      changePasswordDto.currentPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password (you might want to add more validation rules)
    if (changePasswordDto.newPassword.length < 8) {
      throw new UnauthorizedException(
        'New password must be at least 8 characters long',
      );
    }

    // Hash and update the new password
    const hashedPassword = await argon2.hash(changePasswordDto.newPassword);
    user.password = hashedPassword;
    user.isFirstLogin = false; // Update first login flag

    await this.userRepository.save(user);
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
