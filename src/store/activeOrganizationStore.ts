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
  lastChangeTimestamp: number | null;

  // Actions
  setActiveOrganization: (organization: Organization | null) => void;
  clearActiveOrganization: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  forceRefreshAllStores: () => void;
}

/**
 * Fonction utilitaire pour forcer le refresh de tous les stores
 * Cette fonction doit être appelée lors du changement d'organisation
 */
export const forceRefreshAllStores = () => {
  // Forcer le refresh du localStorage pour tous les stores
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

  // Émettre un événement personnalisé pour notifier les composants
  window.dispatchEvent(
    new CustomEvent("organization-changed", {
      detail: { timestamp: Date.now() },
    })
  );

  // Forcer un refresh de la page pour s'assurer que tous les composants se rechargent
  window.location.reload();
};

export const useActiveOrganizationStore = create<ActiveOrganizationStore>()(
  persist(
    (set) => ({
      // État initial
      activeOrganization: null,
      loading: false,
      error: null,
      lastChangeTimestamp: null,

      // Actions
      setActiveOrganization: (organization) => {
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
