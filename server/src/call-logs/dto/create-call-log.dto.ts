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
  call_date?: string;

  @IsDateString()
  @IsOptional()
  next_followup_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  repeat_followup?: boolean;

  @IsBoolean()
  @IsOptional()
  do_not_followup?: boolean;

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
