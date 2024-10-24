import {
  Injectable,
  UnauthorizedException,
  //   BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendPasswordResetOTP(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // For security reasons, don't reveal if email exists
      return;
    }

    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    user.password_reset_token = await argon2.hash(otp);
    user.password_reset_expires_at = expiresAt;
    await this.userRepository.save(user);

    await this.emailService.sendOTPEmail(email, otp);
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (
      !user ||
      !user.password_reset_token ||
      !user.password_reset_expires_at
    ) {
      throw new UnauthorizedException('Invalid or expired OTP request');
    }

    if (new Date() > user.password_reset_expires_at) {
      throw new UnauthorizedException('OTP has expired');
    }

    const isValidOTP = await argon2.verify(user.password_reset_token, otp);
    if (!isValidOTP) {
      throw new UnauthorizedException('Invalid OTP');
    }

    return true;
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    // First verify the OTP
    await this.verifyOTP(email, otp);

    const user = await this.userRepository.findOne({ where: { email } });
    user.password = await argon2.hash(newPassword);
    user.password_reset_token = null;
    user.password_reset_expires_at = null;
    await this.userRepository.save(user);
  }
}
