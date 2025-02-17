import { Module } from '@nestjs/common';
import { CalllogFollowupsController } from './calllog_followups.controller';
import { CalllogFollowupsService } from './calllog_followups.service';

@Module({
  controllers: [CalllogFollowupsController],
  providers: [CalllogFollowupsService]
})
export class CalllogFollowupsModule {}
