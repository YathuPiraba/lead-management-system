import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class SessionInfo {
  @IsString()
  tokenId: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @IsString()
  userAgent: string;

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsBoolean()
  isCurrent: boolean;

  @IsOptional()
  @IsDateString()
  lastActivity?: string;
}
