import {
  // IsString,
  IsEmail,
  // IsNotEmpty,
  // IsOptional,
  // IsUrl,
  // IsInt,
} from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;
}
