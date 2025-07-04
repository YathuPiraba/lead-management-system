import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './roles.entity';
import { ActivityLog } from '../../activity-logs/entities/activity_logs.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { CallLog } from '../../contacts/entities/call_logs.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpireAt: Date;

  @Column({ default: true })
  isFirstLogin: boolean;

  @Column({ type: 'boolean', default: false })
  termsAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt: Date;

  @Column({ default: 'v1.0' })
  termsVersionAccepted: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @OneToMany(() => ActivityLog, (log) => log.user)
  activityLogs: ActivityLog[];

  @OneToOne(() => Staff, (staff) => staff.user)
  staff: Staff;

  @OneToMany(() => CallLog, (callLog) => callLog.user)
  callLogs: CallLog[];
}
