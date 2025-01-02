import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';

@Entity('call_logs')
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.id)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp' })
  call_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_followup_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  repeat_followup: boolean;

  @Column({ type: 'boolean', default: false })
  do_not_followup: boolean;

  @Column({ type: 'integer', default: 0 })
  followup_count: number;

  @Column({ type: 'varchar', length: 255, default: 'open' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
