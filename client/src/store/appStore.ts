import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import {
  createOrganizationSlice,
  OrganizationSlice,
} from "./slices/organizationSlice";

type AppStore = AuthSlice & OrganizationSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createOrganizationSlice(...a),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        organization: state.organization,
      }),
    }
  )
);
