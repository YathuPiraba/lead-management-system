import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Staff } from '../staff/staff.entity';

@Entity()
export class Performance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Staff, (staff) => staff.id)
  staff: Staff;

  @Column({ type: 'date' })
  month: Date;

  @Column({ type: 'int' })
  score: number;
}
