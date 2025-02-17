import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { CallLog } from '../call-logs/call-log.entity';
import { AddStudentCallLogDto } from './dto/add-student-call-log.dto';
import { CallLogFollowup } from 'src/calllog_followups/calllog_followups.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
    @InjectRepository(CallLogFollowup)
    private followupRepository: Repository<CallLogFollowup>,
  ) {}

  async addStudentAndCallLog(data: AddStudentCallLogDto): Promise<any> {
    const { student, callLog } = data;

    // Create and save the student
    const newStudent = this.studentRepository.create(student);
    const savedStudent = await this.studentRepository.save(newStudent);

    // Create the Call Log entry
    const newCallLog = this.callLogRepository.create({
      ...callLog,
      student: savedStudent,
      followup_count: 1,
      user: { id: callLog.userId },
      status: callLog.repeat_followup ? 'open' : 'closed',
      notes: callLog.repeat_followup ? null : callLog.notes,
    });

    const savedCallLog = await this.callLogRepository.save(newCallLog);

    let savedFollowup = null;
    if (callLog.repeat_followup) {
      const newFollowup = this.followupRepository.create({
        callLog: savedCallLog,
        notes: callLog.notes,
        followup_date: callLog.next_followup_date,
      });

      savedFollowup = await this.followupRepository.save(newFollowup);
    }

    return {
      student: savedStudent,
      callLog: savedCallLog,
      followup: savedFollowup,
    };
  }
}
