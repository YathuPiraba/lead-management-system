import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, Between } from 'typeorm';
import { CallLog } from './call-log.entity';
import { CallLogFollowup } from 'src/calllog_followups/calllog_followups.entity';

@Injectable()
export class CallLogsService {
  constructor(
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,

    @InjectRepository(CallLogFollowup)
    private followupRepository: Repository<CallLogFollowup>,
  ) {}

  async getCallLogs(
    page = 1,
    limit = 10,
    studentName?: string,
    phone?: string,
    date?: string,
    status?: string,
    sort: 'ASC' | 'DESC' = 'DESC',
  ): Promise<any> {
    const whereConditions: any[] = [];

    if (studentName?.trim()) {
      whereConditions.push({ student: { name: ILike(`%${studentName}%`) } });
    }
    if (phone?.trim()) {
      whereConditions.push({ student: { phone_number: ILike(`%${phone}%`) } });
    }
    if (status?.trim()) {
      whereConditions.push({ status: ILike(`%${status}%`) });
    }
    if (date?.trim()) {
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
      relations: ['student', 'user', 'followups'],
      where: whereConditions.length > 0 ? whereConditions : undefined,
      order: {
        call_date: sort,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Function to get the latest follow-up note
    const getLatestFollowupNote = (log: any): string | null => {
      if (log.followups?.length) {
        const latestFollowup = [...log.followups].sort(
          (a, b) =>
            new Date(b.followup_date).getTime() -
            new Date(a.followup_date).getTime(),
        )[0];
        return latestFollowup.notes || null;
      }
      return null;
    };

    const formattedCallLogs = data.map((log) => ({
      id: log.id,
      studentName: log.student.name,
      phone: log.student.phone_number,
      date: formatTo12Hour(log.call_date),
      status: log.status,
      notes: getLatestFollowupNote(log) || log.notes,
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

  async getCallLogsWithFollowups(
    page = 1,
    limit = 10,
    studentName?: string,
    phone?: string,
    date?: string,
    status?: string,
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
    if (date && date.trim()) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereConditions.push({ call_date: Between(startOfDay, endOfDay) });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [data, total] = await this.callLogRepository.findAndCount({
      relations: ['student', 'user', 'followups', 'followups.assignedStaff'],
      where: whereConditions.length > 0 ? whereConditions : undefined,
      order: { created_at: 'DESC' },
    });

    const repeatFollowupLogs = data.filter((log) => log.repeat_followup);

    // Extract today's repeat follow-ups
    const repeatFollowupsToday = repeatFollowupLogs.filter((log) =>
      log.followups.some(
        (followup) =>
          new Date(followup.followup_date) >= todayStart &&
          new Date(followup.followup_date) <= todayEnd,
      ),
    );

    // Get the most recent followup date for each log
    const getLatestFollowupDate = (log: any): Date | null => {
      if (log.followups && log.followups.length > 0) {
        return new Date(
          Math.max(
            ...log.followups.map((f) => new Date(f.followup_date).getTime()),
          ),
        );
      }
      return null; // No followups available
    };

    const remainingData = repeatFollowupLogs
      .filter((log) => !repeatFollowupsToday.includes(log))
      .sort((a, b) => {
        const dateA = getLatestFollowupDate(a)?.getTime() || 0;
        const dateB = getLatestFollowupDate(b)?.getTime() || 0;
        return dateB - dateA; // Sort by latest followup date (DESC)
      });

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const formattedCallLogs = [...repeatFollowupsToday, ...remainingData]
      .slice(startIndex, endIndex)
      .map((log) => {
        const latestFollowupDate = getLatestFollowupDate(log);
        return {
          id: log.id,
          studentName: log.student?.name || 'N/A',
          phone: log.student?.phone_number || 'N/A',
          date: formatTo12Hour(log.call_date),
          status: log.status,
          notes: log.notes,
          followupCount: log.followup_count,
          followupDate: latestFollowupDate
            ? formatTo12Hour(latestFollowupDate)
            : 'N/A',
          followups:
            log.followups.length > 0
              ? log.followups.map((followup) => ({
                  id: followup.id,
                  followupDate: followup.followup_date,
                  completed: followup.completed,
                  notes: followup.notes,
                  assignedStaff: followup.assignedStaff
                    ? {
                        id: followup.assignedStaff.id,
                        name: followup.assignedStaff.firstName,
                      }
                    : null,
                }))
              : null,
        };
      });

    return {
      data: formattedCallLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: endIndex < total,
        hasPreviousPage: startIndex > 0,
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
