import { api } from "@/lib/api-client";
import { LoginDto } from "@/interfaces/auth.interface";

export const loginUser = async (data: LoginDto) => {
  const response = await api.post("/auth/login", data);
  return response;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response;
};

export const getUserDetails = async () => {
  const response = await api.get("/auth/user-details");
  return response.data;
};

export const verifyAccessToken = async () => {
  const response = await api.get<{ valid: boolean }>("/auth/verify");
  return response.data.valid;
};
