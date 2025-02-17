import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { CallLogFollowup } from '../calllog_followups/calllog_followups.entity';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  contactNo: number;

  @Column({ type: 'enum', enum: ['Active', 'Inactive'], default: 'Active' })
  status: string;

  @Column({ type: 'int', default: 0 })
  assignedLeads: number;

  @OneToMany(() => CallLogFollowup, (followup) => followup.callLog, {
    cascade: true,
  })
  followups: CallLogFollowup[];
}
