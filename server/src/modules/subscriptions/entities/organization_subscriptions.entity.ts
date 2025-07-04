import { Organization } from '../../organization/entities/organizations.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionPlan } from './subscription_plans.entity';

@Entity('organization_subscriptions')
export class OrganizationSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @ManyToOne(() => SubscriptionPlan)
  subscriptionPlan: SubscriptionPlan;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'success' })
  paymentStatus: string;

  @Column({ nullable: true })
  paymentGatewayId: string;

  @Column({ default: false })
  isTrial: boolean;

  @Column({ nullable: true })
  trialStartDate: Date;

  @Column({ nullable: true })
  trialEndDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
