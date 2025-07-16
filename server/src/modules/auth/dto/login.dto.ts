import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'StrongPassword123!',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Optional subdomain for tenant validation',
    example: 'example',
    required: false,
  })
  @IsString()
  @IsOptional()
  subdomain?: string;
}
