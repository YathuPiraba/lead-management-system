import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SubscriptionPlanFeature } from './subscription_plan_features.entity';
import { OrganizationSubscription } from './organization_subscriptions.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column()
  duration: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isTrialAvailable: boolean;

  @Column({ nullable: true })
  trialPeriodDays: number;

  @OneToMany(
    () => SubscriptionPlanFeature,
    (feature) => feature.subscriptionPlan,
  )
  features: SubscriptionPlanFeature[];

  @OneToMany(() => OrganizationSubscription, (sub) => sub.subscriptionPlan)
  subscriptions: OrganizationSubscription[];
}
