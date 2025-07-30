import { StateCreator } from "zustand";
import { LoginDto } from "@/interfaces/auth.interface";
import { loginUser, logoutUser, getUserDetails } from "@/services/userService";
import { User } from "@/interfaces/user.interface";

export interface AuthSlice {
  user: object | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  getUserDetails: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
  get
) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (loginData: LoginDto) => {
    try {
      set({ isLoading: true, error: null });

      await loginUser(loginData);
      await get().getUserDetails();

      set({ isAuthenticated: true, isLoading: false });
    } catch (err) {
      const errorMessage = (err as Error).message;
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      console.error(err);
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });

      await logoutUser();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      localStorage.removeItem("auth-storage");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      console.error(err);

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  getUserDetails: async () => {
    try {
      set({ isLoading: true, error: null });

      const userData = await getUserDetails();

      set({
        user: userData as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      console.error(err);
    }
  },

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
});
