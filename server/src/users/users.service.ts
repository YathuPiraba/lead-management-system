import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from './role.entity';

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
    const { password, roleId, ...restUserData } = createUserDto;

    // Hash the password
    const hashedPassword = await argon2.hash(password);

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
}
