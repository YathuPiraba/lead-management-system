import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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
    search = '',
    sort: 'ASC' | 'DESC' = 'DESC',
  ): Promise<any> {
    const [data, total] = await this.callLogRepository.findAndCount({
      relations: ['student', 'user'],
      where: search
        ? [
            { student: { name: ILike(`%${search}%`) } },
            { student: { phone_number: ILike(`%${search}%`) } },
            { notes: ILike(`%${search}%`) },
          ]
        : undefined,
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
      date: log.call_date,
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
