import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { CallLog } from '../call-logs/call-log.entity';
import { User } from '../users/user.entity';

@Entity('followup_actions')
export class FollowUpAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CallLog, (callLog) => callLog.id)
  callLog: CallLog;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'text' })
  action_taken: string;

  @CreateDateColumn()
  created_at: Date;
}
