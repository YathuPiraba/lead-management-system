import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallLogsService } from './call-logs.service';
import { CallLogsController } from './call-logs.controller';
import { CallLog } from './call-log.entity';
import { CallLogFollowup } from 'src/calllog_followups/calllog_followups.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CallLog, CallLogFollowup])],
  controllers: [CallLogsController],
  providers: [CallLogsService],
})
export class CallLogsModule {}
