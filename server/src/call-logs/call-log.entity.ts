import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';

@Entity('call_logs')
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.id)
  student: Student;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'date' })
  call_date: Date;

  @Column({ type: 'date', nullable: true })
  next_followup_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  repeat_followup: boolean;

  @Column({ type: 'boolean', default: false })
  do_not_followup: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
