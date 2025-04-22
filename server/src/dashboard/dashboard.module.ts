import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/student.entity';
import { CallLog } from '../call-logs/call-log.entity';
import { CallLogFollowup } from '../calllog_followups/calllog_followups.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, CallLog, CallLogFollowup])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
