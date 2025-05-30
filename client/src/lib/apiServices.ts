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
export const updateUser = async (
  userId: string,
  updatedData: { name?: string; email?: string }
) => {
  try {
    const response = await apiClient.put<ApiResponse<{ user: string }>>(
      `/users/${userId}`,
      updatedData
    );
    return response.data.data;
  } catch (error) {
    console.error(error); // Re-throw error for further handling by the caller
  }
};

// Delete a user
export const deleteUser = async (userId: string) => {
  try {
    await apiClient.delete(`/users/${userId}`);
    return true; // Return true if the deletion was successful
  } catch (error) {
    console.error(error); // Re-throw error for further handling by the caller
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
