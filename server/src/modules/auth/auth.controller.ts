import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../user/entities/roles.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user and set access token in cookie' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { username, password, subdomain } = loginDto;
    res.locals.message = 'Login successfull';
    return this.authService.login(username, password, subdomain, res);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns user details including isFirstLogin',
  })
  @Get('user-details')
  async getProfile(@Req() req: Request) {
    const user = req.user;
    return this.authService.getUserDetails(user);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshTokens(req, res);
  }

  @Public()
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and clear session tokens' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
