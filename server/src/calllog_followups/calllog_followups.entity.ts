import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { CallLog } from '../call-logs/call-log.entity';
import { User } from '../users/user.entity';

@Entity('call_log_followups')
export class CallLogFollowup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: false })
  followupDate: Date;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => CallLog, (callLog) => callLog.followups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'callLogId' })
  callLog: CallLog;

  @ManyToOne(() => User, (user) => user.followups, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignedStaffId' })
  assignedStaff: User;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
