import { apiClient } from "@/lib/api-client";

export const fetchOrgConfig = async (subdomain: string) => {
  try {
    const response = await apiClient.get(`/organizations/${subdomain}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching organization config:", error);
    return null;
  }
};
