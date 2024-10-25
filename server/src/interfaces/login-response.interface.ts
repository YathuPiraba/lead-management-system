export interface LoginResponse {
  accessToken: string;
  isFirstLogin: boolean;
  user: {
    id: number;
    email: string;
    userName: string;
    firstName: string;
  };
}
