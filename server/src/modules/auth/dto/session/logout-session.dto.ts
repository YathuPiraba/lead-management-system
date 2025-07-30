import { IsString, IsOptional, IsEnum } from 'class-validator';

export class LogoutSessionDto {
  @IsString()
  tokenId: string;

  @IsOptional()
  @IsEnum(['user_initiated', 'security', 'admin', 'expired'])
  reason?: 'user_initiated' | 'security' | 'admin' | 'expired';
}
