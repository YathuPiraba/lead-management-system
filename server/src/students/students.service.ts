import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  async addStudentAndCallLog(data: AddStudentCallLogDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create and save the student
      const newStudent = this.studentRepository.create(data.student);
      const savedStudent = await queryRunner.manager.save(Student, newStudent);

      // Get the next lead number
      const result = await queryRunner.query(
        `SELECT 'Lead #' || LPAD(nextval('lead_no_seq')::TEXT, 4, '0') as lead_no`,
      );
      const leadNo = result[0].lead_no;

      // Create the Call Log entry with snake_case property names to match entity
      const newCallLog = this.callLogRepository.create({
        leadNo: leadNo,
        studentId: savedStudent.id,
        userId: data.callLog.userId,
        call_date: data.callLog.call_date,
        repeat_followup: data.callLog.repeat_followup,
        do_not_followup: data.callLog.do_not_followup,
        followup_count: 1,
        status: data.callLog.repeat_followup ? 'open' : 'closed',
        notes: data.callLog.repeat_followup ? null : data.callLog.notes,
      });

      const savedCallLog = await queryRunner.manager.save(CallLog, newCallLog);

      let savedFollowup = null;
      if (data.callLog.repeat_followup && data.callLog.next_followup_date) {
        const newFollowup = this.followupRepository.create({
          callLog: savedCallLog, // Use the relation instead of ID
          followup_date: new Date(data.callLog.next_followup_date),
          notes: data.callLog.notes,
          completed: false,
        });

        savedFollowup = await queryRunner.manager.save(
          CallLogFollowup,
          newFollowup,
        );
      }

      await queryRunner.commitTransaction();

      return {
        student: savedStudent,
        callLog: savedCallLog,
        followup: savedFollowup,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
