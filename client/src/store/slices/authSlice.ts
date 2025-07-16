import { StateCreator } from "zustand";
import { AxiosError } from "axios";
import { LoginDto } from "@/interfaces/auth.interface";
import { loginUser, logoutUser, getUserDetails } from "@/services/userService";

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
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || "Login failed";

      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      throw error;
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
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || "Logout failed";
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

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
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error.response?.data?.message || "Failed to get user details";

      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
});
