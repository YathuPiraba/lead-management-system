import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Put,
  Param,
  Res,
  Req,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // For handling file uploads
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

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

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.usersService.login(loginDto);
    // Set refresh token in cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(HttpStatus.OK).json({ accessToken });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken']; // Access refresh token from request cookies

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const userId = await this.redis.get(refreshToken); // Get user ID from Redis
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate a new access token
    const accessToken = this.jwtService.sign({ id: userId });

    return res.status(HttpStatus.OK).json({ accessToken });
  }
}
