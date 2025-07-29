import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SubscriptionPlanDto {
  @ApiProperty({
    example: 'Pro Plan',
    description: 'Name of the subscription plan',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 49.99,
    description: 'Price of the subscription plan in USD',
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'monthly',
    description: 'Duration of the plan (e.g., monthly, yearly)',
  })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the subscription plan is active',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates if a trial is available for this plan',
  })
  @IsBoolean()
  @IsOptional()
  isTrialAvailable: boolean;

  @ApiProperty({
    example: 14,
    description: 'Number of trial period days',
    required: false,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  trialPeriodDays?: number;

  @ApiProperty({
    example: ['feature-uuid-1', 'feature-uuid-2'],
    description: 'List of existing feature IDs to assign',
    required: false,
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  featureIds?: string[];
}
