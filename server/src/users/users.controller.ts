import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // For handling file uploads
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('image')) // Use FileInterceptor to handle the image
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() image: Express.Multer.File, // Image file uploaded
  ): Promise<User> {
    return this.usersService.register(createUserDto, image); // Pass createUserDto and image
  }
}
