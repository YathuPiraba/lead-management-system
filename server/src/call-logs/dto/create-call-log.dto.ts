import {
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class CreateCallLogDto {
  @IsUUID()
  studentId: string;

  @IsDateString()
  @IsOptional()
  callDate?: string;

  @IsDateString()
  @IsOptional()
  nextFollowupDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  repeatFollowup?: boolean;

  @IsBoolean()
  @IsOptional()
  doNotFollowup?: boolean;

  @IsInt()
  @Min(0)
  @Max(4)
  @IsOptional()
  followupCount?: number;

  @IsString()
  @IsOptional()
  @IsIn(['open', 'closed', 'pending'])
  status?: string;

  @IsInt()
  userId: number;
}
