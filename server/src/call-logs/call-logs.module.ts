import { Module } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';

@Module({
  providers: [CallLogsService]
})
export class CallLogsModule {}
