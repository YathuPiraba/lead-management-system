import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallLogsService } from './call-logs.service';
import { CallLogsController } from './call-logs.controller';
import { CallLog } from './call-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CallLog])],
  controllers: [CallLogsController],
  providers: [CallLogsService],
})
export class CallLogsModule {}
