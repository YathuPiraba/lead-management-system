import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './student.entity';
import { CallLog } from '../call-logs/call-log.entity';
import { CallLogFollowup } from 'src/calllog_followups/calllog_followups.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, CallLog, CallLogFollowup])],
  providers: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule {}
