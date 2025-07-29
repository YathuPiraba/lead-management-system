import {
  ApiError,
  ApiResponse,
  ErrorResponse,
} from "@/interfaces/api-response.interface";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Global reference to session timeout hook
let sessionTimeoutCallback: (() => void) | null = null;

export const setSessionTimeoutCallback = (callback: () => void) => {
  sessionTimeoutCallback = callback;
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return {
      ...response,
      data: response.data,
    };
  },
  async (error: AxiosError<ErrorResponse | ApiResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh-token");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (sessionTimeoutCallback) {
          sessionTimeoutCallback();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data?.message) {
      const apiError: ApiError = new Error(error.response.data.message);
      apiError.statusCode = error.response.data.statusCode;

      if ("error" in error.response.data) {
        const errorData = error.response.data as ErrorResponse;
        apiError.error = errorData.error;
        apiError.timestamp = errorData.timestamp;
        apiError.path = errorData.path;
      } else {
        const successData = error.response.data as ApiResponse;
        apiError.success = successData.success;
        apiError.data = successData.data;
      }

      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      const errorMessage = (error as ApiError)?.message || "Request failed";
      throw new Error(errorMessage);
    }
  },

  post: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      const errorMessage = (error as ApiError)?.message || "Request failed";
      throw new Error(errorMessage);
    }
  },

  put: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      const errorMessage = (error as ApiError)?.message || "Request failed";
      throw new Error(errorMessage);
    }
  },

  patch: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      const errorMessage = (error as ApiError)?.message || "Request failed";
      throw new Error(errorMessage);
    }
  },

  delete: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      const errorMessage = (error as ApiError)?.message || "Request failed";
      throw new Error(errorMessage);
    }
  },
};
