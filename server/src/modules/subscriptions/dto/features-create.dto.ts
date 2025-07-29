import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFeaturesDto {
  @ApiProperty({ example: 'Feature 1', description: 'Name of the feature' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'DAILY_NOTIFICATIONS',
    description: 'Code of the feature',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'Daily notifications',
    description: 'description of the feature',
  })
  @IsString()
  @IsOptional()
  description: string;
}
