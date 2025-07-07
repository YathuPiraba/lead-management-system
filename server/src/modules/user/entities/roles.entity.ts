import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './users.entity';

export enum UserType {
  PRODUCT_ADMIN = 'product_admin',
  ORG_ADMIN = 'org_admin',
  ORG_STAFF = 'org_staff',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
