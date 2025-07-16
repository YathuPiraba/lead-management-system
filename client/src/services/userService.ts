// src/services/userService.ts
import { apiClient } from "@/lib/api-client";
import { LoginDto } from "@/interfaces/auth.interface";

export const loginUser = async (data: LoginDto) => {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

export const getUserDetails = async () => {
  const response = await apiClient.get("/auth/user-details");
  return response.data.data;
};
