import apiClient from "./axios";
import { ApiResponse } from "./axios";

export const getStudentStatsApi = async () => {
  try {
    const response = await apiClient.get<ApiResponse>(`/students/stats`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};
