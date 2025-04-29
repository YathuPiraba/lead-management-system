import apiClient from "./axios";
import { ApiResponse } from "./axios";

// Get user data
export const getUserData = async (userId: string) => {
  try {
    const response = await apiClient.get<ApiResponse<{ user: string }>>(
      `/users/${userId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
};

// Create a new user
export const registerStaff = async (userData: FormData) => {
  try {
    const response = await apiClient.post<ApiResponse<{ user: string }>>(
      "/users/register_user",
      userData
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// Update user data
export const updateUserAPI = async (userId: number, userData: FormData) => {
  try {
    const response = await apiClient.put<ApiResponse>(
      `/users/update_user/${userId}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Delete a user
export const deleteImageAPI = async (userId: number) => {
  try {
    const res = await apiClient.delete(`/users/delete-image/${userId}`);
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const addStudentAndCallLog = async (data: object) => {
  try {
    const response = await apiClient.post<
      ApiResponse<{ student: string; callLog: string }>
    >("/students/add-student-call-log", data);
    return response.data;
  } catch (error) {
    console.error(error); // Re-throw error for further handling by the caller
  }
};
