import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffPerformance } from './entities/staff_performance.entity';
import { StaffService } from './services/staff.service';
import { PerformanceService } from './services/performance.service';
import { StaffController } from './staff.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, StaffPerformance])],
  providers: [StaffService, PerformanceService],
  controllers: [StaffController],
  exports: [StaffService, PerformanceService],
})
export class StaffModule {}
