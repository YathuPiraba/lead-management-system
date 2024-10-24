import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @IsUrl()
  @IsOptional()
  image?: string;
}
