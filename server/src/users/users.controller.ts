import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Put,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // For handling file uploads
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register_user')
  @UseInterceptors(FileInterceptor('image'))
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() image: Express.Multer.File, // Image file uploaded
  ): Promise<User> {
    return this.usersService.register(createUserDto, image); // Pass createUserDto and image
  }

  @Put('update_user/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string, // User ID from the URL
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<User> {
    return this.usersService.updateUser(+id, updateUserDto, image);
  }
}
