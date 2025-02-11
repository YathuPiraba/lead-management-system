import apiClient from "./axios";
import { ApiResponse } from "./axios";

export type CallLogType = {
  id: string;
  studentName: string;
  phone: string;
  date: string;
  status: string;
  notes: string;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  itemsPerPage: number;
};

export type PaginatedApiResponse<T> = {
  data: T[];
  pagination: PaginationInfo;
};

export const getCallLogs = async (
  params?: PaginationParams & {
    studentName?: string;
    phone?: string;
    date?: string;
    status?: string;
    notes?: string;
  }
): Promise<PaginatedApiResponse<CallLogType> | undefined> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ data: CallLogType[]; pagination: PaginationInfo }>
    >("/call-logs", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        studentName: params?.studentName,
        phone: params?.phone,
        date: params?.date,
        status: params?.status,
        notes: params?.notes,
      },
    });

    // Transform the data
    const transformedData: CallLogType[] = response.data.data.data.map(
      (log) => ({
        id: log.id,
        studentName: log.studentName,
        phone: log.phone,
        date: log.date,
        status: log.status,
        notes: log.notes,
      })
    );

    // Extract pagination information
    const pagination: PaginationInfo = response.data.data.pagination;

    return {
      data: transformedData,
      pagination,
    };
  } catch (error) {
    console.error(error);
    return undefined; // Ensure the function always returns a value
  }
};
