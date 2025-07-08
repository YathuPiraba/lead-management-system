import { UserType } from '../../user/entities/roles.entity';

export interface UserInterface {
  type: UserType;
  userId: string;
  username: string;
  email: string;
  roleId: number;
  orgId?: string;
}

export interface RefreshTokenPayload extends UserInterface {
  tokenId: string;
}
