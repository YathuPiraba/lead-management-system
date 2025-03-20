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
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/auth/token.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
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
    try {
      await this.usersService.register(createUserDto, image);
      return res.status(HttpStatus.OK).json({
        data: null,
        message: `Staff username and password have been sent to staff's email.`,
        status: HttpStatus.OK,
      });
    } catch (error) {
      console.error(error);

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        data: null,
        message:
          error.message ||
          'Failed to register staff member. Please try again later.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { accessToken, refreshToken, temporaryToken, isFirstLogin, message } =
      await this.usersService.login(loginDto);

    // If first login, return temporary token for password change
    if (isFirstLogin) {
      return res.status(HttpStatus.OK).json({
        isFirstLogin,
        message,
        temporaryToken,
      });
    }

    // If accessToken and refreshToken are present, set the cookies
    if (accessToken && refreshToken) {
      const cookieName =
        process.env.NODE_ENV.trim() === 'production'
          ? '__Secure-refreshToken'
          : 'refreshToken';

      res.cookie(cookieName, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV.trim() === 'production',
        sameSite: this.configService.get('SAME_SITE') || 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: this.configService.get('COOKIE_DOMAIN') || undefined,
      });

      // Send the successful login response with tokens
      return res.status(HttpStatus.OK).json({
        accessToken,
        isFirstLogin,
        message: 'Login successful',
      });
    }
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    // Invalidate the refresh token in Redis
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    await this.tokenService.invalidateRefreshToken(payload.sub);

    // Remove the refresh token from cookies
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: this.configService.get('SAME_SITE') || 'none',
      path: '/',
      domain: this.configService.get('COOKIE_DOMAIN') || undefined,
    });

    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { accessToken } =
        await this.tokenService.refreshAccessToken(refreshToken);
      return res.status(200).json({ accessToken });
    } catch (error) {
      throw new UnauthorizedException(error.message);
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return res.status(HttpStatus.OK).json({
      message: 'User details fetched successfully',
      user: userWithoutPassword,
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
          secure: process.env.NODE_ENV === 'production',
          sameSite: this.configService.get('SAME_SITE') || 'none',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
          domain: this.configService.get('COOKIE_DOMAIN') || undefined,
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
