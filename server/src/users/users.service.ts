import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from './role.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
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
}
