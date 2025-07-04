import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationConfig } from './organization_configs.entity';
import { OrganizationSubscription } from '../../subscriptions/entities/organization_subscriptions.entity';
import { License } from '../../subscriptions/entities/licenses.entity';
import { ActivityLog } from '../../activity-logs/entities/activity_logs.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Contact } from '../../contacts/entities/contacts.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  contactEmail: string;

  @Column()
  phoneNumber: string;

  @Column()
  country: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  firstAcceptedByUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => OrganizationConfig, (config) => config.organization)
  config: OrganizationConfig;

  @OneToMany(
    () => OrganizationSubscription,
    (subscription) => subscription.organization,
  )
  subscriptions: OrganizationSubscription[];

  @OneToMany(() => License, (license) => license.organization)
  licenses: License[];

  @OneToMany(() => ActivityLog, (log) => log.organization)
  activityLogs: ActivityLog[];

  @OneToMany(() => Staff, (staff) => staff.organization)
  staffMembers: Staff[];

  @OneToMany(() => Contact, (contact) => contact.organization)
  contacts: Contact[];
}
