import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardStats() {
    const stats = await this.dashboardService.getDashboardStats();
    return {
      data: stats,
      message: 'Dashboard Stats fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }
}
