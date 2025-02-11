import apiClient from "./axios";
import { ApiResponse } from "./axios";
import {
  PaginationParams,
  PaginationInfo,
  PaginatedApiResponse,
} from "./call-logs.api";

export interface StaffResponse {
  id: number;
  staffId: number | null;
  status: "Active" | "Inactive" | "N/A";
  performance: "High" | "Medium" | "Low" | "N/A";
  assignedLeads: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | "N/A";
  };
}

export const getStaffMembers = async (
  params?: PaginationParams & { search?: string }
): Promise<PaginatedApiResponse<StaffResponse> | undefined> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ data: StaffResponse[]; pagination: PaginationInfo }>
    >("/staff", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search,
      },
    });

    const { data, pagination } = response.data.data;

    return { data, pagination };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const getStaffStats = async () => {
  try {
    const response = await apiClient.get<ApiResponse>(`/staff/stats`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};
