import { Controller, Get, Param, Query } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffResponseDto } from './dto/staff.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('stats')
  async getStaffStats() {
    const response = await this.staffService.getStaffStats();
    return {
      data: response,
      message: 'Staff Stats fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }

  @Get()
  async getAllStaffMembers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ): Promise<any> {
    const response = await this.staffService.getAllStaffMembers(
      page,
      limit,
      search,
    );
    return {
      data: response,
      message: 'Staff members fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }

  @Get(':id')
  async getStaffMemberById(@Param('id') id: number): Promise<StaffResponseDto> {
    return this.staffService.getStaffMemberById(id);
  }
}
