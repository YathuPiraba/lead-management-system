import { IsNumber, IsObject } from 'class-validator';

export class SessionStatsDto {
  @IsNumber()
  totalSessions: number;

  @IsNumber()
  activeSessions: number;

  @IsObject()
  deviceBreakdown: Record<string, number>;

  @IsObject()
  locationBreakdown: Record<string, number>;
}
