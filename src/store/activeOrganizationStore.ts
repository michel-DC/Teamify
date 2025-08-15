import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization {
  id: number;
  publicId: string;
  name: string;
  bio?: string;
  profileImage?: string;
  memberCount: number;
  organizationType: string;
  mission: string;
  location?: {
    city: string;
    lat: number;
    lon: number;
    displayName?: string;
  } | null;
  createdAt: string;
}

interface ActiveOrganizationStore {
  // État
  activeOrganization: Organization | null;
  loading: boolean;
  error: string | null;

  // Actions
  setActiveOrganization: (organization: Organization | null) => void;
  clearActiveOrganization: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useActiveOrganizationStore = create<ActiveOrganizationStore>()(
  persist(
    (set) => ({
      // État initial
      activeOrganization: null,
      loading: false,
      error: null,

      // Actions
      setActiveOrganization: (organization) => {
        set({ activeOrganization: organization, error: null });
      },

      clearActiveOrganization: () => {
        set({ activeOrganization: null, error: null });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "active-organization-storage",
      partialize: (state) => ({
        activeOrganization: state.activeOrganization,
      }),
    }
  )
);
