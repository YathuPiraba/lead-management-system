import { User } from '../../user/entities/users.entity';
import { Organization } from '../../organization/entities/organizations.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
