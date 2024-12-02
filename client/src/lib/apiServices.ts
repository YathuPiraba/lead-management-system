// src/lib/apiServices.ts
import apiClient from "./axios"; // Import the axios client from your previous setup
import { ApiResponse } from "./axios"; // Import ApiResponse type for strong typing

// Get user data
export const getUserData = async (userId: string) => {
  try {
    const response = await apiClient.get<ApiResponse<{ user: string }>>(
      `/users/${userId}`
    );
    return response.data.data; // Return the response data (user info in this case)
  } catch (error) {
    throw error; // Re-throw error for further handling by the caller
  }
};

// Create a new user
export const registerStaff = async (userData: FormData) => {
  try {
    const response = await apiClient.post<ApiResponse<{ user: string }>>(
      "/users/register_user",
      userData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error; // Re-throw error for further handling by the caller
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
    return response.data.data; // Return the updated user data
  } catch (error) {
    throw error; // Re-throw error for further handling by the caller
  }
};

// Delete a user
export const deleteUser = async (userId: string) => {
  try {
    await apiClient.delete(`/users/${userId}`);
    return true; // Return true if the deletion was successful
  } catch (error) {
    throw error; // Re-throw error for further handling by the caller
  }
};
