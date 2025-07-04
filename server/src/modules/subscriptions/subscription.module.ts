import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Features } from './entities/features.entity';
import { License } from './entities/licenses.entity';
import { OrganizationSubscription } from './entities/organization_subscriptions.entity';
import { SubscriptionPlan } from './entities/subscription_plans.entity';
import { SubscriptionPlanFeature } from './entities/subscription_plan_features.entity';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './controller/subscription.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Features,
      License,
      OrganizationSubscription,
      SubscriptionPlan,
      SubscriptionPlanFeature,
    ]),
  ],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
