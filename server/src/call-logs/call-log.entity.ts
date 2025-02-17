import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';
import { CallLogFollowup } from '../calllog_followups/calllog_followups.entity';
@Entity('call_logs')
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  leadNo: string;

  @ManyToOne(() => Student, { nullable: true })
  student: Student;

  @Column({ nullable: true })
  studentId: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'timestamp' })
  call_date: Date;

  @Column({ default: false })
  repeat_followup: boolean;

  @Column({ default: false })
  do_not_followup: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 0 })
  followup_count: number;

  @Column({
    type: 'enum',
    enum: ['open', 'closed'],
    default: 'open',
  })
  status: string;

  @Column({ default: false })
  isExpired: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => CallLogFollowup, (followup) => followup.callLog)
  followups: CallLogFollowup[];
}
