import { Controller, Get, Query } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';

@Controller('call-logs')
export class CallLogsController {
  constructor(private readonly callLogsService: CallLogsService) {}

  @Get()
  async getCallLogs(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('studentName') studentName?: string,
    @Query('phone') phone?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    const callLogs = await this.callLogsService.getCallLogs(
      page,
      limit,
      studentName,
      phone,
      date,
      status,
    );

    return {
      data: callLogs,
      message: 'Call Logs fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }

  @Get('with-followups')
  async getCallLogsWithFollowups(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('studentName') studentName?: string,
    @Query('phone') phone?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: 'ASC' | 'DESC',
  ) {
    const callLogsfolowups =
      await this.callLogsService.getCallLogsWithFollowups(
        page,
        limit,
        studentName,
        phone,
        date,
        status,
        sort,
      );
    return {
      data: callLogsfolowups,
      message: 'Followups fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }

  @Get('stats')
  async getDashboardStats() {
    const followupStats = await this.callLogsService.getDashboardStats();
    return {
      data: followupStats,
      message: 'Followup Stats fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }
}
