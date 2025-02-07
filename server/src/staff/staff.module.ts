import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';

@Module({
  providers: [StaffService]
})
export class StaffModule {}
