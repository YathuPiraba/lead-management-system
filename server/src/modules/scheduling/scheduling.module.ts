import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ContactsModule } from '../contacts/contacts.module';
import { NotificationModule } from '../notification/notification.module';
import { SubscriptionModule } from '../subscriptions/subscription.module';
// import { FollowupSchedulerService } from './followup-scheduler.service';
// import { LicenseExpiryProcessor } from './license-expiry.processor';

import { redisConfig } from '../../config/redis.config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: redisConfig(),
    }),
    BullModule.registerQueue({
      name: 'licenseExpiryQueue',
    }),
    ContactsModule,
    NotificationModule,
    SubscriptionModule,
  ],
  //   providers: [FollowupSchedulerService, LicenseExpiryProcessor],
})
export class SchedulingModule {}
