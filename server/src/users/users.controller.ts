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
  Get,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // For handling file uploads
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Public()
  @Post('register_user')
  @UseInterceptors(FileInterceptor('image'))
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ): Promise<Response> {
    await this.usersService.register(createUserDto, image); // Execute registration process

    // Return a success message
    return res.status(HttpStatus.OK).json({
      message: 'Your username and password have been sent to your email.',
    });
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    const { accessToken, refreshToken, isFirstLogin } =
      await this.usersService.login(loginDto);

    // Set refresh token in cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(HttpStatus.OK).json({
      accessToken,
      isFirstLogin,
    });
  }

  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ): Promise<Response> {
    const userId = (req as any).user.id;

    try {
      await this.usersService.changePassword(userId, changePasswordDto);

      // If it's first login, generate new tokens after password change
      if ((req as any).user.isFirstLogin) {
        const { accessToken, refreshToken } =
          await this.usersService.generateNewTokens(userId);

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(HttpStatus.OK).json({
          message: 'Password changed successfully',
          accessToken,
        });
      }

      return res.status(HttpStatus.OK).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: error.message,
        });
      }
      throw error;
    }
  }

  @Get('user-details')
  @UseGuards(JwtAuthGuard) // Use guard to ensure the user is authenticated
  async getUserDetails(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const userId = (req as any).user.id;

    // Fetch user details
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'User not found' });
    }

    // Remove the password field before returning the user details
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return res.status(HttpStatus.OK).json({
      message: 'User details fetched successfully',
      user: userWithoutPassword,
    });
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

  @Put('update_user/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string, // User ID from the URL
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response, // Add the response parameter
  ): Promise<Response> {
    const updatedUser = await this.usersService.updateUser(
      +id,
      updateUserDto,
      image,
    );

    // Return a success message and the updated user data
    return res.status(HttpStatus.OK).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  }

  @Delete('delete-image/:userID')
  async deleteImage(
    @Param('userID') userID: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      // Fetch the user by userID
      const user = await this.usersService.findUserById(userID);
      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'User not found' });
      }

      // Check if the user has an image URL
      if (!user.image) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'No image found for this user',
        });
      }

      // Delete the image from Cloudinary
      const result = await this.cloudinaryService.deleteImage(user.image);

      // Update the user's record to remove the image URL
      await this.usersService.updateUser(userID, { image: null });

      return res.status(HttpStatus.OK).json({
        message: 'Image deleted successfully',
        result,
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to delete image',
        error: error.message,
      });
    }
  }

  @Public()
  @Put('update-image/:userID')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Param('userID') userID: number,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'No file uploaded',
        });
      }

      // Fetch the user by userID
      const user = await this.usersService.findUserById(userID);
      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'User not found' });
      }

      // Delete the existing image from Cloudinary if it exists
      if (user.image) {
        await this.cloudinaryService.deleteImage(user.image);
      }

      // Upload the new image to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(file);

      // Update the user's record with the new image URL
      await this.usersService.updateUser(userID, { image: uploadResult.url });

      return res.status(HttpStatus.OK).json({
        message: 'Image updated successfully',
        imageUrl: uploadResult.url,
      });
    } catch (error) {
      console.error('Error updating image:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to update image',
        error: error.message,
      });
    }
  }
}
