import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contact } from './contacts.entity';
import { User } from '../../user/entities/users.entity';
import { CallLogFollowup } from './call_log_followups.entity';

@Entity('call_logs')
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contact)
  contact: Contact;

  @ManyToOne(() => User)
  user: User;

  @Column()
  callDate: Date;

  @Column({ default: false })
  repeatFollowup: boolean;

  @Column({ default: false })
  doNotFollowup: boolean;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => CallLogFollowup, (followup) => followup.callLog)
  followups: CallLogFollowup[];
}
