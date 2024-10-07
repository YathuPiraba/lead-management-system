import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
    image: Express.Multer.File,
  ): Promise<User> {
    const { password } = createUserDto;

    const hashedPassword = await argon2.hash(password);

    let userData = {
      ...createUserDto,
      password: hashedPassword,
    };

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
