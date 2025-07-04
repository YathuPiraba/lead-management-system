import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SubscriptionPlanFeature } from './subscription_plan_features.entity';

@Entity('features')
export class Features {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => SubscriptionPlanFeature, (spf) => spf.feature)
  subscriptionPlans: SubscriptionPlanFeature[];
}
