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
    private followUpRepository: Repository<CallLogFollowup>,
  ) {}

  /**
   * Gets the latest followup from an array of followups
   * @param followups Array of followup objects
   * @returns The latest followup object or null if none exists
   */
  private getLatestFollowup(followups: any[]): any | null {
    if (!followups?.length) return null;

    return [...followups].sort(
      (a, b) =>
        new Date(b.followup_date).getTime() -
        new Date(a.followup_date).getTime(),
    )[0];
  }

  /**
   * Gets the latest followup date from an array of followups
   * @param followups Array of followup objects
   * @returns Date object of the latest followup or null if none exists
   */
  private getLatestFollowupDate(followups: any[]): Date | null {
    if (!followups?.length) return null;

    return new Date(
      Math.max(...followups.map((f) => new Date(f.followup_date).getTime())),
    );
  }

  /**
   * Gets the latest followup note
   * @param followups Array of followup objects
   * @returns Latest followup note string or null if none exists
   */
  private getLatestFollowupNote(followups: any[]): string | null {
    const latestFollowup = this.getLatestFollowup(followups);
    return latestFollowup?.notes || null;
  }

  /**
   * Calculates how overdue a followup is compared to current time
   * @param followupDate The date to compare against current time
   * @returns Formatted string showing days, hours and minutes overdue
   */
  private calculateOverdueDuration(followupDate: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - followupDate.getTime();

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} days ${hours} hrs ${minutes} mins`;
  }

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

    const formattedCallLogs = data.map((log) => ({
      id: log.id,
      studentName: log.student.name,
      phone: log.student.phone_number,
      date: formatTo12Hour(log.call_date),
      status: log.status,
      notes: this.getLatestFollowupNote(log.followups) || log.notes,
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

    const [data, _] = await this.callLogRepository.findAndCount({
      relations: ['student', 'user', 'followups', 'followups.assignedStaff'],
      where: whereConditions.length > 0 ? whereConditions : undefined,
      order: { created_at: 'DESC' },
    });

    // Check and update expiry status for call logs
    await this.updateExpiredCallLogs(data);

    const repeatFollowupLogs = data.filter((log) => log.repeat_followup);

    const repeatFollowupsToday = repeatFollowupLogs.filter((log) =>
      log.followups.some(
        (followup) =>
          new Date(followup.followup_date) >= todayStart &&
          new Date(followup.followup_date) <= todayEnd,
      ),
    );

    // Filter out logs with isExpired=true
    const activeCallLogs = repeatFollowupLogs.filter((log) => !log.isExpired);

    // Split between today's followups and remaining active ones
    const todayActiveLogs = activeCallLogs.filter((log) =>
      repeatFollowupsToday.includes(log),
    );

    const remainingActiveLogs = activeCallLogs
      .filter((log) => !todayActiveLogs.includes(log))
      .sort((a, b) => {
        const dateA = this.getLatestFollowupDate(a.followups)?.getTime() || 0;
        const dateB = this.getLatestFollowupDate(b.followups)?.getTime() || 0;
        return dateB - dateA;
      });

    // Combine and get total filtered count
    const filteredData = [...todayActiveLogs, ...remainingActiveLogs];
    const total = filteredData.length;

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const formattedCallLogs = filteredData
      .slice(startIndex, endIndex)
      .map((log) => {
        const latestFollowupDate = this.getLatestFollowupDate(log.followups);
        return {
          id: log.id,
          studentName: log.student?.name || 'N/A',
          phone: log.student?.phone_number || 'N/A',
          date: formatTo12Hour(log.call_date),
          status: log.status,
          notes: log.notes,
          leadNo: log.leadNo,
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

  async getDashboardStats() {
    // Get the current date in UTC
    const now = new Date();

    // Set to start of today in UTC (00:00:00)
    const today = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
      ),
    );

    // Set to end of today in UTC (23:59:59.999)
    const endOfDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    // Set start of next week in UTC
    const nextWeekStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0,
        0,
        0,
      ),
    );

    // Set end of next week in UTC
    const nextWeekEnd = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 7,
        23,
        59,
        59,
        999,
      ),
    );

    const [data, _] = await this.callLogRepository.findAndCount({
      relations: ['student', 'user', 'followups', 'followups.assignedStaff'],
      order: { created_at: 'DESC' },
    });

    // Check and update expiry status for call logs
    await this.updateExpiredCallLogs(data);

    const missedCallLogs = await this.callLogRepository.count({
      where: { isExpired: true },
    });

    const dueToday = await this.followUpRepository.count({
      where: {
        followup_date: Between(today, endOfDay),
        completed: false,
      },
    });

    // Get follow-ups completed today
    const completedToday = await this.followUpRepository.count({
      where: {
        followup_date: Between(today, endOfDay),
        completed: true,
        updatedAt: Between(today, endOfDay),
      },
    });

    // Get upcoming follow-ups for next week
    const upcoming = await this.followUpRepository.count({
      where: {
        followup_date: Between(nextWeekStart, nextWeekEnd),
        completed: false,
      },
    });

    return {
      dueToday: dueToday || 0,
      completedToday: completedToday || 0,
      upcoming: upcoming || 0,
      missedCallLogs: missedCallLogs || 0,
    };
  }

  async getExpiredFollowups(
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

    // Get logs where isExpired is true
    const baseCondition = { isExpired: true };
    const finalConditions =
      whereConditions.length > 0
        ? [baseCondition, ...whereConditions]
        : baseCondition;

    const [data, total] = await this.callLogRepository.findAndCount({
      relations: ['student', 'user', 'followups', 'followups.assignedStaff'],
      where: finalConditions,
      order: { created_at: sort },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Sort logs by the date of the latest followup
    const sortedData = data.sort((a, b) => {
      const dateA = this.getLatestFollowupDate(a.followups)?.getTime() || 0;
      const dateB = this.getLatestFollowupDate(b.followups)?.getTime() || 0;
      return sort === 'DESC' ? dateB - dateA : dateA - dateB;
    });

    // Format the data for response
    const formattedExpiredLogs = sortedData.map((log) => {
      // Find the latest followup
      const latestFollowup = this.getLatestFollowup(log.followups);

      // Calculate days overdue
      const daysOverdue = latestFollowup
        ? this.calculateOverdueDuration(new Date(latestFollowup.followup_date))
        : '0 days 0 hrs 0 mins';

      return {
        id: log.id,
        studentName: log.student?.name || 'N/A',
        phone: log.student?.phone_number || 'N/A',
        calldate: formatTo12Hour(log.call_date),
        status: log.status,
        notes: log.notes,
        leadNo: log.leadNo,
        followupCount: log.followup_count,
        lastFollowupDate: latestFollowup
          ? formatTo12Hour(new Date(latestFollowup.followup_date))
          : 'N/A',
        daysOverdue,
        assignedStaff: latestFollowup?.assignedStaff
          ? {
              id: latestFollowup.assignedStaff.id,
              name: latestFollowup.assignedStaff.firstName,
            }
          : null,
        lastFollowupNotes: latestFollowup?.notes || 'No notes',
        followups: log.followups.map((followup) => ({
          id: followup.id,
          followupDate: formatTo12Hour(new Date(followup.followup_date)),
          completed: followup.completed,
          notes: followup.notes,
          assignedStaff: followup.assignedStaff
            ? {
                id: followup.assignedStaff.id,
                name: followup.assignedStaff.firstName,
              }
            : null,
        })),
      };
    });

    return {
      data: formattedExpiredLogs,
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

  private async updateExpiredCallLogs(logs: any[]): Promise<void> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const logsToUpdate = logs.filter((log) => {
      if (log.followups && log.followups.length > 0) {
        const latestFollowupDate = this.getLatestFollowupDate(log.followups);

        const latestFollowup = this.getLatestFollowup(log.followups);

        return (
          latestFollowup &&
          !latestFollowup.completed &&
          latestFollowupDate < todayStart
        );
      }
      return false;
    });

    if (logsToUpdate.length > 0) {
      logsToUpdate.forEach((log) => (log.isExpired = true));
      await this.callLogRepository.save(logsToUpdate);
    }
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
