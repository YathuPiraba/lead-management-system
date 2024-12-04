import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './student.entity';
import { CallLog } from '../call-logs/call-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, CallLog])],
  providers: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule {}
