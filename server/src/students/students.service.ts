import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, ILike, Not, Repository } from 'typeorm';
import { Student } from './student.entity';
import { CallLog } from '../call-logs/call-log.entity';
import { AddStudentCallLogDto } from './dto/add-student-call-log.dto';
import { CallLogFollowup } from 'src/calllog_followups/calllog_followups.entity';
import {
  StudentSearchDto,
  StudentResponseDto,
  PaginationInfo,
} from './dto/student-search.dto';
import { formatTo12Hour } from 'src/call-logs/call-logs.service';

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
      const studentData = { ...data.student };

      // Override the student status to 'reject' only when repeat_followup is false
      if (data.callLog && data.callLog.repeat_followup === false) {
        studentData.status = 'reject';
      }

      const newStudent = this.studentRepository.create(studentData);
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
          followup_date: data.callLog.next_followup_date,
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

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async countTotalStudents(): Promise<number> {
    return this.studentRepository.count({
      where: {
        status: Not('reject'),
      },
    });
  }

  async countStudentsByStatus(
    status: 'hold' | 'active' | 'lead' | 'reject',
  ): Promise<number> {
    return this.studentRepository.count({
      where: { status },
    });
  }

  async countNewLeadsThisWeek(): Promise<number> {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return this.studentRepository.count({
      where: {
        status: 'lead',
        created_at: Between(oneWeekAgo, today),
      },
    });
  }

  async calculateConversionRate(): Promise<number> {
    // Count leads that converted to active students in the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalLeads = await this.studentRepository.count({
      where: {
        status: 'lead',
      },
    });

    if (totalLeads === 0) {
      return 0;
    }

    const convertedLeads = await this.studentRepository.count({
      where: {
        status: 'active',
        created_at: Between(thirtyDaysAgo, today),
      },
    });

    return Math.round((convertedLeads / totalLeads) * 100);
  }

  async getStudentsWithLastContact(
    queryParams: StudentSearchDto,
  ): Promise<{ data: StudentResponseDto[]; pagination: PaginationInfo }> {
    const { search, status, page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;

    // Build query conditions
    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      where.status = Not('reject');
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const totalItems = await this.studentRepository.count({ where });

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit);

    const paginationInfo: PaginationInfo = {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalItems,
      itemsPerPage: limit,
    };

    // Get students with pagination
    const students = await this.studentRepository.find({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    // Get the last contact date for each student
    const studentsWithLastContact: StudentResponseDto[] = await Promise.all(
      students.map(async (student) => {
        const lastContact = await this.getLastContactDate(student.id);
        return {
          ...student,
          lastContact: formatTo12Hour(new Date(lastContact)),
        };
      }),
    );

    return {
      data: studentsWithLastContact,
      pagination: paginationInfo,
    };
  }

  private async getLastContactDate(studentId: string): Promise<Date | null> {
    // Find the most recent call log for this student
    const callLog = await this.callLogRepository.findOne({
      where: { studentId },
      order: { call_date: 'DESC' },
    });

    if (!callLog) {
      return null;
    }

    // Check if there's a followup for this call log
    const followups = await this.followupRepository.find({
      where: { callLog: { id: callLog.id } },
      order: { followup_date: 'DESC' },
    });

    // Find the most recent completed followup (if any)
    const completedFollowup = followups.find(
      (followup) => followup.completed === true,
    );

    // Use the completed followup date if found, otherwise use the original call date
    const call_date = completedFollowup
      ? completedFollowup.followup_date
      : callLog.call_date;

    // Return the followup date if exists, otherwise return the call date
    return call_date;
  }
}
