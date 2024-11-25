import axios, {
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  AxiosRequestHeaders,
} from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Types for API responses
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

// Extended config interface, compatible with Axios' InternalAxiosRequestConfig
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  isFormData?: boolean;
  skipAuthRefresh?: boolean;
  retryCount?: number;
  _retry?: boolean;
  headers: AxiosRequestHeaders;
}

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const TOKEN_COOKIE_NAME = "access_token";
const REFRESH_ENDPOINT = "/refresh";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000, // 10 second timeout
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);

    // Ensure headers are defined
    config.headers = config.headers || ({} as AxiosRequestHeaders);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type based on request type
    if (config.isFormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    // Initialize retry count if undefined
    config.retryCount = config.retryCount || 0;

    return config;
  },
  (error: AxiosError) => {
    toast.error("Request configuration failed. Please try again."); // Show error toast
    return Promise.reject(
      new ApiError(
        error.response?.status || 500,
        "Request configuration failed",
        error.response?.data
      )
    );
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Handle network errors
    if (!error.response) {
      toast.error("Network error occurred. Please check your connection."); // Show error toast
      return Promise.reject(new ApiError(500, "Network error occurred", error));
    }

    // Handle rate limiting (HTTP 429)
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

    // Handle authentication errors (HTTP 401)
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${process.env.NEXT_PUBLIC_API_URL}${REFRESH_ENDPOINT}`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        Cookies.set(TOKEN_COOKIE_NAME, accessToken);

        originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        Cookies.remove(TOKEN_COOKIE_NAME);
        toast.error("Authentication failed. Please log in again.");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(
          new ApiError(401, "Authentication failed", refreshError)
        );
      }
    }

    // Handle other types of errors
    toast.error("An error occurred. Please try again later."); // Show error toast
    return Promise.reject(
      new ApiError(
        error.response?.status || 500,
        "An error occurred",
        error.response?.data
      )
    );
  }
);

// Utility function for handling API responses
export const handleApiResponse = async <T>(
  promise: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.message); // Show error toast with the message from ApiError
      throw error;
    }
    toast.error("Unknown error occurred. Please try again."); // Show generic error toast
    throw new ApiError(500, "Unknown error occurred", error);
  }
};

export default apiClient;
