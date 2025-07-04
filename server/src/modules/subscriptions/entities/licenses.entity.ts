import { Organization } from '../../organization/entities/organizations.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column()
  licenseKey: string;

  @Column()
  expiryDate: Date;

  @Column()
  staffLimit: number;

  @Column()
  leadLimit: number;

  @Column({ default: false })
  isTrial: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
