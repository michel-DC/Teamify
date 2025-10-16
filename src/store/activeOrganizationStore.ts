import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization 
{
  id: number;
  publicId: string;
  name: string;
  bio?: string;
  profileImage: string | null;
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

interface ActiveOrganizationStore 
{
  activeOrganization: Organization | null;
  loading: boolean;
  error: string | null;
  lastChangeTimestamp: number | null;

  setActiveOrganization: (organization: Organization | null) => void;
  clearActiveOrganization: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  forceRefreshAllStores: () => void;
}

export const forceRefreshAllStores = () => {
  const storesToRefresh = [
    "events-storage",
    "organizations-storage",
    "sidebar-storage",
    "tasks-storage",
  ];

  storesToRefresh.forEach((storeName) => {
    try {
      localStorage.removeItem(storeName);
    } catch (error) {
      console.warn(`Impossible de supprimer le store ${storeName}:`, error);
    }
  });

  window.dispatchEvent(
    new CustomEvent("organization-changed", {
      detail: { timestamp: Date.now() },
    })
  );

};

export const useActiveOrganizationStore = create<ActiveOrganizationStore>()(
  persist(
    (set) => ({
      activeOrganization: null,
      loading: false,
      error: null,
      lastChangeTimestamp: null,

      setActiveOrganization: (organization) => {
        try {
          localStorage.removeItem("sidebar-storage");
        } catch (error) {
          console.warn("Impossible de supprimer sidebar-storage:", error);
        }

        set({
          activeOrganization: organization,
          error: null,
          lastChangeTimestamp: Date.now(),
        });
      },

      clearActiveOrganization: () => {
        set({
          activeOrganization: null,
          error: null,
          lastChangeTimestamp: Date.now(),
        });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      forceRefreshAllStores: () => {
        forceRefreshAllStores();
      },
    }),
    {
      name: "active-organization-storage",
      partialize: (state) => ({
        activeOrganization: state.activeOrganization,
        lastChangeTimestamp: state.lastChangeTimestamp,
      }),
    }
  )
);
