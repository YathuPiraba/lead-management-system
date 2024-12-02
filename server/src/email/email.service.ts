import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getOTPEmailTemplate } from '../templates/otp-email.template';
import { getStaffCredentialsTemplate } from 'src/templates/staff-credential.template';
import { SentMessageInfo, Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter<SentMessageInfo, Options>;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOTPEmail(
    email: string,
    otp: string,
    userName: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Password Reset OTP',
      html: getOTPEmailTemplate(otp, 10, userName), // 10 minutes expiry
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendStaffCredentials(
    email: string,
    username: string,
    password: string,
    firstName: string,
  ): Promise<void> {
    const loginUrl = this.configService.get('LOGIN_URL');

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Your Staff Account Credentials',
      html: getStaffCredentialsTemplate(
        username,
        password,
        firstName,
        loginUrl,
      ),
    };

    await this.transporter.sendMail(mailOptions);
  }
}
