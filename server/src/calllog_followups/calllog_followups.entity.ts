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
import { Staff } from 'src/staff/staff.entity';

@Entity('call_log_followups')
export class CallLogFollowup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: false })
  followup_date: Date;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => CallLog, (callLog) => callLog.followups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'callLogId' })
  callLog: CallLog;

  @ManyToOne(() => Staff, (staff) => staff.followups, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignedStaffId' })
  assignedStaff: Staff;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at', // Add this
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at', // Add this
  })
  updatedAt: Date;
}
