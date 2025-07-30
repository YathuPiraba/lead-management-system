import { Organization } from "@/interfaces/organization.interface";
import { api } from "@/lib/api-client";

export const fetchOrgConfig = async (subdomain: string) => {
  try {
    const response = await api.get<Organization>(`/organizations/${subdomain}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching organization config:", error);
    return null;
  }
};

export async function validateSubdomain(subdomain: string): Promise<boolean> {
  try {
    const response = await api.get<{ exists: boolean }>(
      `/tenant/validate/${subdomain}`
    );
    return response.data.exists;
  } catch (err) {
    console.error("Subdomain validation failed:", err);
    return false;
  }
}
