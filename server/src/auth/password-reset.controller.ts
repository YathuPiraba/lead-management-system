import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth/password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.passwordResetService.sendPasswordResetOTP(dto.email);
    return { message: 'If the email exists, an OTP has been sent' };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOTP(@Body() dto: VerifyOTPDto) {
    const isValid = await this.passwordResetService.verifyOTP(
      dto.email,
      dto.otp,
    );
    return { valid: isValid };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
    return { message: 'Password has been reset successfully' };
  }
}
