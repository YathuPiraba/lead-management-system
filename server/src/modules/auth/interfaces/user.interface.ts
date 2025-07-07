export type UserType = 'product_admin' | 'org_admin' | 'org_staff';

export interface UserInterface {
  type: UserType;
  userId: number;
  username: string;
  email: string;
  roleId: number;
  orgId?: number;
}
