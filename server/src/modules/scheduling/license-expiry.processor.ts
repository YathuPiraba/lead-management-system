// import { Processor, Process } from '@nestjs/bull';
// import { Job } from 'bull';
// import { NotificationService } from '../notification/notification.service';
// import { Logger } from '@nestjs/common';
// import { SubscriptionService } from '../subscriptions/services/subscription.service';

// @Processor('licenseExpiryQueue')
// export class LicenseExpiryProcessor {
//   private readonly logger = new Logger(LicenseExpiryProcessor.name);

//   constructor(
//     private readonly subscriptionService: SubscriptionService,
//     private readonly notificationService: NotificationService,
//   ) {}

//   @Process('checkLicenseExpiry')
//   async handleLicenseExpiryJob(job: Job) {
//     this.logger.debug(`Processing license expiry job for org ${job.data.organizationId}`);

//     const isExpired = await this.subscriptionService.isLicenseExpired(job.data.organizationId);
//     if (isExpired) {
//       await this.notificationService.notifyAdminLicenseExpired(job.data.organizationId);
//       this.logger.debug(`Notified admin about expired license for org ${job.data.organizationId}`);
//     } else {
//       this.logger.debug(`License is still valid for org ${job.data.organizationId}`);
//     }
//   }
// }
