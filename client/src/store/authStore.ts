import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../lib/api-client";
import { LoginDto, AuthState, AuthActions } from "../types/auth";
import { AxiosError } from "axios";

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (loginData: LoginDto) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.post("/auth/login", loginData);

          console.log("Login response:", response.data);

          // After successful login, get user details
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

          await apiClient.post("/auth/logout");

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

          const response = await apiClient.get("/auth/user-details");
          const userData = response.data.data;

          console.log("User details:", userData);

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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
