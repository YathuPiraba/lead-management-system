import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { CallLog } from '../call-logs/call-log.entity';
import { AddStudentCallLogDto } from './dto/add-student-call-log.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
  ) {}

  async addStudentAndCallLog(data: AddStudentCallLogDto): Promise<any> {
    const { student, callLog } = data;

    // Create and save the student
    const newStudent = this.studentRepository.create(student);
    const savedStudent = await this.studentRepository.save(newStudent);

    // Assign the saved student to the call log's `student` relationship
    const newCallLog = this.callLogRepository.create({
      ...callLog,
      student: savedStudent,
      followup_count: 1,
      user: { id: callLog.userId },
      next_followup_date: callLog.next_followup_date
        ? callLog.next_followup_date
        : null,
      status: callLog.next_followup_date ? 'open' : 'closed',
    });

    const savedCallLog = await this.callLogRepository.save(newCallLog);

    return { student: savedStudent, callLog: savedCallLog };
  }
}
