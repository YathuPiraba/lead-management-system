import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallLog } from './call-log.entity';

@Injectable()
export class CallLogsService {
  constructor(
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
  ) {}

  async getCallLogs(): Promise<any[]> {
    const rawCallLogs = await this.callLogRepository.find({
      relations: ['student', 'user'],
    });

    // Map the raw call logs into the desired format
    const formattedCallLogs = rawCallLogs.map((log) => ({
      id: log.id,
      studentName: log.student.name,
      phone: log.student.phone_number,
      date: log.call_date,
      status: log.status,
      notes: log.notes,
    }));

    return formattedCallLogs;
  }
}
