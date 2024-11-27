import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient, { handleApiResponse, ApiError } from "@/lib/axios";
// import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  // Add other user fields based on your API response
}

interface LoginResponse {
  accessToken: string;
  isFirstLogin: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUserDetails: () => Promise<void>;
  resetState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await handleApiResponse<LoginResponse>(
            apiClient.post("/login", { email, password })
          );

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { accessToken, isFirstLogin } = response;

          // Cookie handling is managed by the API response
          set({
            isAuthenticated: true,
            isLoading: false,
          });

          // Fetch user details after successful login
          await get().fetchUserDetails();

          return isFirstLogin;
        } catch (error) {
          set({
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await handleApiResponse(apiClient.post("/logout"));
          get().resetState();
        } catch (error) {
          // Even if the API call fails, we want to clear the local state
          get().resetState();
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUserDetails: async () => {
        set({ isLoading: true });
        try {
          const user = await handleApiResponse<User>(
            apiClient.get("/user-details")
          );

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            get().resetState();
          }
          set({ isLoading: false });
          throw error;
        }
      },

      resetState: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
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

// Listen for session expiration events
if (typeof window !== "undefined") {
  window.addEventListener("session:expired", () => {
    useAuthStore.getState().resetState();
  });
}

// Export a hook for TypeScript support
export const useAuth = () => useAuthStore();
