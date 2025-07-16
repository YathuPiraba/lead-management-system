import { StateCreator } from "zustand";
import { fetchOrgConfig } from "@/services/organizationService";
import { Organization } from "@/interfaces/organization.interface";

export interface OrganizationSlice {
  organization: Organization | null;
  isOrgLoading: boolean;
  fetchOrganization: (subdomain: string) => Promise<void>;
  clearOrganization: () => void;
  setOrganization: (org: Organization | null) => void;
}

export const createOrganizationSlice: StateCreator<
  OrganizationSlice,
  [],
  [],
  OrganizationSlice
> = (
  set
  // get
) => ({
  organization: null,
  isOrgLoading: false,

  fetchOrganization: async (subdomain: string) => {
    // const currentOrg = get().organization;

    // // If we already have the organization for this subdomain, don't fetch again
    // if (currentOrg && currentOrg.config.loginUrlSubdomain === subdomain) {
    //   return;
    // }

    try {
      set({ isOrgLoading: true });
      const org = await fetchOrgConfig(subdomain);
      set({ organization: org, isOrgLoading: false });
    } catch (err) {
      set({ organization: null, isOrgLoading: false });
      throw err;
    }
  },

  clearOrganization: () => set({ organization: null }),

  setOrganization: (org: Organization | null) => set({ organization: org }),
});
