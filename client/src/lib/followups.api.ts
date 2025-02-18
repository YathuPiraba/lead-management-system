import apiClient from "./axios";
import { ApiResponse } from "./axios";
import {
  PaginationParams,
  PaginationInfo,
  PaginatedApiResponse,
} from "./call-logs.api";

export interface Followup {
  id: string;
  followupDate: string;
  completed: boolean;
  notes: string;
  assignedStaff: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CallLogResponse {
  id: string;
  studentName: string;
  phone: string;
  date: string;
  status: string;
  notes: string;
  leadNo: string;
  followupCount: number;
  followupDate: string;
  followups: Followup[] | null;
}

export const getCallLogsWithFollowups = async (
  params?: PaginationParams & {
    studentName?: string;
    phone?: string;
    date?: string;
    status?: string;
    notes?: string;
  }
): Promise<PaginatedApiResponse<CallLogResponse> | undefined> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ data: CallLogResponse[]; pagination: PaginationInfo }>
    >("/call-logs/with-followups", {
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

    const { data, pagination } = response.data.data;

    // You can map the data or process it here if needed
    return { data, pagination };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const getFollowupStats = async () => {
  try {
    const response = await apiClient.get<ApiResponse>(`/call-logs/stats`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};
