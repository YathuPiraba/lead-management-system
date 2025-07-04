import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity_logs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [TypeOrmModule],
})
export class ActivityModule {}
