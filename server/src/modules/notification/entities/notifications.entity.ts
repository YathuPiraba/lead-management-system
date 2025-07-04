import { User } from '../../auth/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  content: string;

  @Column({ default: false })
  read: boolean;

  @Column()
  type: string; // today_followup, subscription_expiry, etc.

  @CreateDateColumn()
  createdAt: Date;
}
