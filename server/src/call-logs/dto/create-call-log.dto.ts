import {
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsUUID,
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
}
