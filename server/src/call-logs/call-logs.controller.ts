import { Controller, Get } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';

@Controller('call-logs')
export class CallLogsController {
  constructor(private readonly callLogsService: CallLogsService) {}

  @Get()
  async getCallLogs() {
    const callLogs = await this.callLogsService.getCallLogs();

    return {
      data: callLogs,
      message: 'Call Logs fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }
}
