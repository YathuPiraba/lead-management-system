export type UserType = "product_admin" | "org_admin" | "org_staff";

export interface User {
  userId: string;
  username: string;
  email: string;
  roleId: string;
  orgId: string;
  type: UserType;
  isFirstLogin: boolean;
  imageUrl?: string;
}
