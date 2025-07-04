import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallLog } from './entities/call_logs.entity';
import { Contact } from './entities/contacts.entity';
import { CallLogFollowup } from './entities/call_log_followups.entity';
import { ContactService } from './services/contact.service';
import { CallLogService } from './services/call_log.service';
import { FollowupService } from './services/followup.service';
import { ContactController } from './controllers/contacts.controller';
import { CallLogController } from './controllers/call_log.controller';
import { FollowupController } from './controllers/followups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CallLog, CallLogFollowup, Contact])],
  providers: [ContactService, CallLogService, FollowupService],
  controllers: [ContactController, CallLogController, FollowupController],
  exports: [TypeOrmModule],
})
export class ContactsModule {}
