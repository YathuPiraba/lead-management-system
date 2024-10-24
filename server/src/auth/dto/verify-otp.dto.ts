import {
  IsString,
  IsEmail,
  Length,
  // IsNotEmpty,
  // IsOptional,
  // IsUrl,
  // IsInt,
} from 'class-validator';

export class VerifyOTPDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
