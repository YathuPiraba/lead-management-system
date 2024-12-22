import axios, {
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  AxiosRequestHeaders,
} from "axios";
import { toast } from "react-hot-toast";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Types for API responses
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  meta?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  status: number;
  code?: string;
}

// Simplified custom config without isFormData
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean;
  retryCount?: number;
  _retry?: boolean;
  headers: AxiosRequestHeaders;
}

// Constants
const MAX_RETRY_ATTEMPTS = 3;
export const TOKEN_STORAGE_KEY = "access_token";
const REFRESH_ENDPOINT = "/users/refresh";

// Event for session expiration
export const SESSION_EXPIRED_EVENT = "session:expired";

const dispatchSessionExpired = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Enhanced request interceptor with automatic content-type detection
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatic content-type detection
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else if (config.data instanceof Blob) {
      config.headers["Content-Type"] = config.data.type;
    } else if (config.data instanceof ArrayBuffer) {
      config.headers["Content-Type"] = "application/octet-stream";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    config.retryCount = config.retryCount || 0;
    return config;
  },
  (error: AxiosError) => {
    toast.error("Request configuration failed. Please try again.");
    return Promise.reject(
      new ApiError(
        error.response?.status || 500,
        "Request configuration failed",
        error.response?.data
      )
    );
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!error.response) {
      return Promise.reject(
        new ApiError(
          500,
          "Network error occurred. Please check your connection.",
          error
        )
      );
    }

    // Handle rate limiting
    if (error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      if (retryAfter && originalRequest.retryCount! < MAX_RETRY_ATTEMPTS) {
        originalRequest.retryCount! += 1;
        await new Promise((resolve) =>
          setTimeout(resolve, parseInt(retryAfter) * 1000)
        );
        return apiClient(originalRequest);
      }
    }

    // Check if this is a session expiration error
    const isSessionExpired =
      error.response.data?.code === "TOKEN_EXPIRED" ||
      error.response.data?.message?.toLowerCase().includes("session expired");

    // Handle authentication errors
    if (error.response.status === 401) {
      // If it's a login attempt, don't show session expired modal
      if (originalRequest.url?.includes("/login")) {
        return Promise.reject(
          new ApiError(
            401,
            error.response.data?.message || "Invalid credentials"
          )
        );
      }

      // For session expiration
      if (
        isSessionExpired &&
        !originalRequest._retry &&
        !originalRequest.skipAuthRefresh
      ) {
        originalRequest._retry = true;

        try {
          const response = await axios.post<{ accessToken: string }>(
            `${process.env.NEXT_PUBLIC_API_URL}${REFRESH_ENDPOINT}`,
            {},
            { withCredentials: true }
          );

          const { accessToken } = response.data;
          localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          dispatchSessionExpired();
          return Promise.reject(
            new ApiError(
              401,
              "Session expired",
              refreshError,
              "SESSION_EXPIRED"
            )
          );
        }
      }
    }

    // Handle other errors
    return Promise.reject(
      new ApiError(
        error.response.status,
        error.response.data?.message || "An error occurred",
        error.response.data,
        error.response.data?.code
      )
    );
  }
);

export const handleApiResponse = async <T>(
  promise: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
  try {
    const response = await promise;
    return response.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      // Don't show toast for session expiration
      if (error.code !== "SESSION_EXPIRED") {
        toast.error(error.message);
      }
      throw error;
    }
    toast.error("Unknown error occurred. Please try again.");
    throw new ApiError(500, "Unknown error occurred", error);
  }
};

// Helper method for making type-safe API requests
export const createApiRequest = {
  get: <T>(url: string, config?: Omit<AxiosRequestConfig, "url">) =>
    handleApiResponse<T>(apiClient.get(url, config)),

  post: <T>(
    url: string,
    data?: unknown,
    config?: Omit<AxiosRequestConfig, "url">
  ) => handleApiResponse<T>(apiClient.post(url, data, config)),

  put: <T>(
    url: string,
    data?: unknown,
    config?: Omit<AxiosRequestConfig, "url">
  ) => handleApiResponse<T>(apiClient.put(url, data, config)),

  delete: <T>(url: string, config?: Omit<AxiosRequestConfig, "url">) =>
    handleApiResponse<T>(apiClient.delete(url, config)),
};

export default apiClient;
