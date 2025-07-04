import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SubscriptionPlan } from './subscription_plans.entity';
import { Features } from './features.entity';

@Entity('subscription_plan_features')
export class SubscriptionPlanFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubscriptionPlan)
  subscriptionPlan: SubscriptionPlan;

  @ManyToOne(() => Features)
  feature: Features;
}
