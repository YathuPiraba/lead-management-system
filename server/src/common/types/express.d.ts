export type UserType = 'product_admin' | 'org_admin' | 'org_staff';

interface User {
  type: UserType;
  userId: number;
  username: string;
  email: string;
  roleId: number;
  orgId?: number;
}
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export {};
