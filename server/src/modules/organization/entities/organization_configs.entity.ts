import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organizations.entity';

@Entity('organization_configs')
export class OrganizationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Organization)
  @JoinColumn()
  organization: Organization;

  @Column()
  loginUrlSubdomain: string;

  @Column()
  emailFromName: string;

  @Column({ nullable: true })
  brandingLogoUrl: string;

  @Column({ default: 'Asia/Kolkata' })
  timezone: string;

  @Column({ default: 'en' })
  language: string;
}
