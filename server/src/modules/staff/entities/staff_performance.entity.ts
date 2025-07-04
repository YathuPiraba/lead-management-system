import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Staff } from './staff.entity';

@Entity('staff_performance')
export class StaffPerformance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Staff)
  staff: Staff;

  @Column()
  month: string;

  @Column()
  totalCalls: number;

  @Column()
  successfulLeads: number;

  @Column()
  missedFollowups: number;
}
