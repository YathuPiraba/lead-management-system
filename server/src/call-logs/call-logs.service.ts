import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, Between } from 'typeorm';
import { CallLog } from './call-log.entity';

@Injectable()
export class CallLogsService {
  constructor(
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
  ) {}

  async getCallLogs(
    page = 1,
    limit = 10,
    studentName?: string,
    phone?: string,
    date?: string,
    status?: string,
    notes?: string,
    sort: 'ASC' | 'DESC' = 'DESC',
  ): Promise<any> {
    const whereConditions: any[] = [];
    if (studentName && studentName.trim()) {
      whereConditions.push({ student: { name: ILike(`%${studentName}%`) } });
    }
    if (phone && phone.trim()) {
      whereConditions.push({ student: { phone_number: ILike(`%${phone}%`) } });
    }
    if (status && status.trim()) {
      whereConditions.push({ status: ILike(`%${status}%`) });
    }
    if (notes && notes.trim()) {
      whereConditions.push({ notes: ILike(`%${notes}%`) });
    }
    if (date && date.trim()) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereConditions.push({
        call_date: Between(startOfDay, endOfDay),
      });
    }
    // Fetch data with filters
    const [data, total] = await this.callLogRepository.findAndCount({
      relations: ['student', 'user'],
      where: whereConditions.length > 0 ? whereConditions : undefined,
      order: {
        call_date: sort,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedCallLogs = data.map((log) => ({
      id: log.id,
      studentName: log.student.name,
      phone: log.student.phone_number,
      date: formatTo12Hour(log.call_date),
      status: log.status,
      notes: log.notes,
    }));

    return {
      data: formattedCallLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }
}

// Helper function to format date to 12-hour format with AM/PM
function formatTo12Hour(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
