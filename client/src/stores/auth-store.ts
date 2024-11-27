import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import apiClient, {
  handleApiResponse,
  ApiError,
  TOKEN_COOKIE_NAME,
} from "@/lib/axios";
import Cookies from "js-cookie";

// Types
interface User {
  id: number;
  userName: string;
  role: {
    id: number;
    name: string;
  };
  roleId: number;
}

interface LoginResponse {
  accessToken?: string;
  isFirstLogin: boolean;
  message: string;
  temporaryToken?: string;
}

interface ChangePasswordResponse {
  message: string;
  accessToken?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  lastActivity: number;
  temporaryToken: string | null;

  // Actions
  login: (userName: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  fetchUserDetails: () => Promise<void>;
  resetState: () => void;
  updateLastActivity: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

// Constants
const SESSION_TIMEOUT = 60 * 60 * 1000; // 30 minutes
const STORAGE_KEY = "auth-storage";

// Custom storage implementation with security checks
const secureStorage = {
  getItem: (key: string) => {
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      const now = Date.now();

      // Check if session has expired
      if (now - parsed.state.lastActivity > SESSION_TIMEOUT) {
        localStorage.removeItem(key);
        window.dispatchEvent(new Event("session:expired"));
        return null;
      }

      return data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      lastActivity: Date.now(),
      temporaryToken: null,

      login: async (userName: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await handleApiResponse<LoginResponse>(
            apiClient.post("/users/login", { userName, password })
          );

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { isFirstLogin, message, accessToken, temporaryToken } =
            response;

          if (isFirstLogin && temporaryToken) {
            // Store temporary token for password change request
            set({
              temporaryToken,
              isAuthenticated: false,
              lastActivity: Date.now(),
            });
          } else if (accessToken) {
            Cookies.set(TOKEN_COOKIE_NAME, accessToken);
            set({
              isAuthenticated: true,
              temporaryToken: null,
              lastActivity: Date.now(),
            });
            await get().fetchUserDetails();
          }

          set({ isLoading: false });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            isAuthenticated: false,
            temporaryToken: null,
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          // Use temporaryToken for first-time password change
          const headers = get().temporaryToken
            ? { Authorization: `Bearer ${get().temporaryToken}` }
            : {};

          const response = await handleApiResponse<ChangePasswordResponse>(
            apiClient.post(
              "/users/change-password",
              { currentPassword, newPassword },
              { headers }
            )
          );

          if (response.accessToken) {
            Cookies.set(TOKEN_COOKIE_NAME, response.accessToken);
            set({
              isAuthenticated: true,
              temporaryToken: null,
              lastActivity: Date.now(),
            });
            await get().fetchUserDetails();
          }
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            get().resetState();
          }
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await handleApiResponse(apiClient.post("/users/logout"));
        } finally {
          get().resetState();
          set({ isLoading: false });
        }
      },

      fetchUserDetails: async () => {
        set({ isLoading: true });
        try {
          const user = await handleApiResponse<User>(
            apiClient.get("/users/user-details")
          );

          // Extract roleId from the role object and add to user state
          set({
            user: {
              ...user,
              roleId: user.role.id,
            },
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
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
        Cookies.remove(TOKEN_COOKIE_NAME);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastActivity: Date.now(),
          temporaryToken: null,
        });
      },

      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Activity tracking
if (typeof window !== "undefined") {
  ["mousedown", "keydown", "touchstart", "scroll"].forEach((event) => {
    window.addEventListener(event, () => {
      useAuthStore.getState().updateLastActivity();
    });
  });

  setInterval(() => {
    const state = useAuthStore.getState();
    if (
      state.isAuthenticated &&
      Date.now() - state.lastActivity > SESSION_TIMEOUT
    ) {
      window.dispatchEvent(new Event("session:expired"));
      state.resetState();
    }
  }, 60000);

  window.addEventListener("session:expired", () => {
    useAuthStore.getState().resetState();
  });
}

export const useAuth = () => useAuthStore();
