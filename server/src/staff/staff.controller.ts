import { Controller, Get, Param, Query } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffResponseDto } from './dto/staff.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('stats')
  async getStaffStats() {
    return this.staffService.getStaffStats();
  }

  @Get()
  @Public()
  async getAllStaffMembers(
    @Query('search') search?: string,
  ): Promise<StaffResponseDto[]> {
    return this.staffService.getAllStaffMembers(search);
  }

  @Get(':id')
  async getStaffMemberById(@Param('id') id: number): Promise<StaffResponseDto> {
    return this.staffService.getStaffMemberById(id);
  }
}
