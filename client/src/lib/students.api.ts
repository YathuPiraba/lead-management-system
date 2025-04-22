import apiClient from "./axios";
import { ApiResponse } from "./axios";
import { PaginationInfo } from "./call-logs.api";

export interface Student {
  id: string;
  name: string;
  phone_number: string;
  address: string;
  department_of_study: string;
  status: string;
  lastContact: string;
  created_at: string;
  updated_at: string;
}

export interface StudentListResponse {
  data: Student[];
  pagination: PaginationInfo;
}

export interface StudentSearchParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const getStudentStatsApi = async () => {
  try {
    const response = await apiClient.get<ApiResponse>(`/students/stats`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const getStudentDetailsApi = async (params?: StudentSearchParams) => {
  try {
    const response = await apiClient.get<ApiResponse<StudentListResponse>>(
      `/students/list`,
      { params }
    );
    return response.data.data;
  } catch (err) {
    console.error(err);
  }
};
