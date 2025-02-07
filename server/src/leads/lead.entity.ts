import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Staff } from '../staff/staff.entity';

@Entity()
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Staff, (staff) => staff.id)
  staff: Staff;

  @Column({
    type: 'enum',
    enum: ['New', 'In Progress', 'Closed'],
    default: 'New',
  })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
