import {
  IsString,
  IsEmail,
  Length,
  MinLength,
  // IsNotEmpty,
  // IsOptional,
  // IsUrl,
  // IsInt,
} from 'class-validator';
export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
