// import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { NotificationService } from '../notification/notification.service';
// import { ContactService } from '../contacts/services/contact.service';

// @Injectable()
// export class FollowupSchedulerService {
//   private readonly logger = new Logger(FollowupSchedulerService.name);

//   constructor(
//     private readonly contactsService: ContactService,
//     private readonly notificationService: NotificationService,
//   ) {}

//   // Run every day at 9:00 AM
//   @Cron(CronExpression.EVERY_DAY_AT_9AM)
//   async handleDailyFollowupReminder() {
//     this.logger.debug('Running daily follow-up reminders');

//     const followupsDue = await this.contactsService.getFollowupsDueToday();

//     for (const followup of followupsDue) {
//       await this.notificationService.sendFollowupReminder(followup.staffId, followup);
//     }

//     this.logger.debug(`Sent ${followupsDue.length} follow-up reminders`);
//   }
// }
