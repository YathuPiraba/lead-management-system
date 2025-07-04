import { Organization } from '../../organization/entities/organizations.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CallLog } from './call_logs.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column()
  department: string;

  @Column({
    type: 'enum',
    enum: ['lead', 'student', 'rejected', 'hold'],
    default: 'lead',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CallLog, (callLog) => callLog.contact)
  callLogs: CallLog[];
}
