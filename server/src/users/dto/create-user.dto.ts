import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsInt,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  contactNo: number;

  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @IsUrl()
  @IsOptional()
  image?: string;
}
