export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError extends Error {
  statusCode?: number;
  success?: boolean;
  data?: unknown;
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}
