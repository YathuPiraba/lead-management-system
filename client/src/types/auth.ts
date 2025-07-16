import { User } from "./user";

export interface LoginDto {
  username: string;
  password: string;
  subdomain: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (loginData: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  getUserDetails: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}
