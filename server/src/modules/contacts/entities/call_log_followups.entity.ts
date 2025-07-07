import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CallLog } from './call_logs.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('call_log_followups')
export class CallLogFollowup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CallLog)
  callLog: CallLog;

  @Column()
  followupDate: Date;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Staff)
  assignedTo: Staff;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
