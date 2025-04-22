import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository, LessThan } from 'typeorm';
import { Student } from '../students/student.entity';
import { CallLog } from '../call-logs/call-log.entity';
import { CallLogFollowup } from '../calllog_followups/calllog_followups.entity';
import {
  endOfDay,
  startOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subMonths,
} from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
    @InjectRepository(CallLogFollowup)
    private followupRepository: Repository<CallLogFollowup>,
    private readonly dataSource: DataSource,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const lastMonth = subMonths(today, 1);

    // Get total leads count
    const totalLeads = await this.studentRepository.count({
      where: { status: 'lead' },
    });

    // Get leads from last month to calculate percentage change
    const lastMonthLeads = await this.studentRepository.count({
      where: {
        status: 'lead',
        created_at: Between(subMonths(lastMonth, 1), lastMonth),
      },
    });

    // Calculate lead growth percentage
    const leadGrowthPercent =
      lastMonthLeads > 0
        ? Math.round(((totalLeads - lastMonthLeads) / lastMonthLeads) * 100)
        : 0;

    // Get today's calls
    const todayCalls = await this.callLogRepository.count({
      where: {
        call_date: Between(startOfDay(today), endOfDay(today)),
      },
    });

    // Get yesterday's calls
    const yesterdayCalls = await this.callLogRepository.count({
      where: {
        call_date: Between(startOfDay(yesterday), endOfDay(yesterday)),
      },
    });

    // Calculate calls change percentage
    const callsChangePercent =
      yesterdayCalls > 0
        ? Math.round(((todayCalls - yesterdayCalls) / yesterdayCalls) * 100)
        : 0;

    // Get pending follow-ups for this week
    const pendingFollowups = await this.followupRepository.count({
      where: {
        followup_date: Between(startOfWeek(today), endOfWeek(today)),
        completed: false,
      },
    });

    // Calculate conversion rate
    const totalActiveStudents = await this.studentRepository.count({
      where: { status: 'active' },
    });

    const conversionRate =
      totalLeads > 0
        ? Math.round((totalActiveStudents / totalLeads) * 100) / 10
        : 0;

    // Calculate previous conversion rate from last month
    const lastMonthActiveStudents = await this.studentRepository.count({
      where: {
        status: 'active',
        created_at: LessThan(lastMonth),
      },
    });

    const lastMonthTotalLeads = await this.studentRepository.count({
      where: {
        status: 'lead',
        created_at: LessThan(lastMonth),
      },
    });

    const lastMonthConversionRate =
      lastMonthTotalLeads > 0
        ? Math.round((lastMonthActiveStudents / lastMonthTotalLeads) * 100) / 10
        : 0;

    const conversionRateChange =
      Math.round((conversionRate - lastMonthConversionRate) * 10) / 10;

    // Get recent activity
    const recentActivity = await this.callLogRepository.find({
      relations: ['student', 'user'],
      where: {},
      order: { call_date: 'DESC' },
      take: 5,
    });

    const formattedRecentActivity = recentActivity.map((log) => {
      // Calculate time difference
      const callTime = new Date(log.call_date);
      const diffInHours = Math.round(
        (today.getTime() - callTime.getTime()) / (1000 * 60 * 60),
      );

      let timeAgo;
      if (diffInHours < 1) {
        timeAgo = 'Just now';
      } else if (diffInHours === 1) {
        timeAgo = '1 hour ago';
      } else if (diffInHours < 24) {
        timeAgo = `${diffInHours} hours ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      }

      return {
        leadNo: log.leadNo,
        studentName: log.student?.name || 'Unknown',
        action: log.notes
          ? log.notes.length > 50
            ? log.notes.substring(0, 50) + '...'
            : log.notes
          : log.repeat_followup
            ? 'Scheduled follow-up'
            : 'Called',
        timeAgo,
        userId: log.userId,
        userName: log.user?.userName || 'Unknown',
      };
    });

    return {
      totalLeads: {
        count: totalLeads,
        changePercent: leadGrowthPercent,
        trending: leadGrowthPercent >= 0 ? 'up' : 'down',
      },
      todayCalls: {
        count: todayCalls,
        changePercent: callsChangePercent,
        trending: callsChangePercent >= 0 ? 'up' : 'down',
      },
      pendingFollowups: {
        count: pendingFollowups,
        dueThisWeek: pendingFollowups,
      },
      conversionRate: {
        rate: conversionRate,
        changePercent: conversionRateChange,
        trending: conversionRateChange >= 0 ? 'up' : 'down',
      },
      recentActivity: formattedRecentActivity,
    };
  }
}
