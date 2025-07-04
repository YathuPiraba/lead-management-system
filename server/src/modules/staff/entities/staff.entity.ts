import { User } from '../../auth/entities/users.entity';
import { Organization } from '../../organization/entities/organizations.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StaffPerformance } from './staff_performance.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => StaffPerformance, (performance) => performance.staff)
  performanceRecords: StaffPerformance[];
}
