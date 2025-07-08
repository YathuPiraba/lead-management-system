import { UserType } from '../../user/entities/roles.entity';

export interface UserInterface {
  type: UserType;
  userId: string;
  username: string;
  email: string;
  roleId: number;
  orgId?: number;
}
