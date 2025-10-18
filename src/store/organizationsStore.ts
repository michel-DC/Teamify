import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization {
  id: number;
  publicId: string;
  name: string;
  bio?: string;
  profileImage: string | null;
  memberCount: number;
  organizationType:
    | "ASSOCIATION"
    | "PME"
    | "ENTREPRISE"
    | "STARTUP"
    | "AUTO_ENTREPRENEUR"
    | string;
  mission: string;
  eventCount: number;
  location?: {
    city: string;
    lat: number;
    lon: number;
    displayName?: string;
  } | null;
  members?: any[] | null;
  createdAt: string;
}

interface OrganizationsStore {
  organizations: Organization[];
  loading: boolean;
  initialized: boolean;
  lastFetch: number | null;
  error: string | null;

  fetchOrganizations: () => Promise<void>;
  addOrganization: (organization: Organization) => void;
  updateOrganization: (orgId: number, updates: Partial<Organization>) => void;
  deleteOrganization: (orgId: number) => void;
  setLoading: (loading: boolean) => void;
  resetStore: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000;

export const useOrganizationsStore = create<OrganizationsStore>()(
  persist(
    (set, get) => ({
      organizations: [],
      loading: false,
      initialized: false,
      lastFetch: null,
      error: null,

      fetchOrganizations: async () => {
        const { initialized, lastFetch } = get();

        if (
          initialized &&
          lastFetch &&
          Date.now() - lastFetch < CACHE_DURATION
        ) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const response = await fetch("/api/user/organizations", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error ||
                "Erreur lors de la récupération des organisations"
            );
          }

          const data = await response.json();

          set({
            organizations: data.organizations || [],
            loading: false,
            initialized: true,
            lastFetch: Date.now(),
            error: null,
          });
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des organisations:",
            error
          );
          set({
            loading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
        }
      },

      addOrganization: (organization: Organization) => {
        set((state) => ({
          organizations: [organization, ...state.organizations],
        }));
      },

      updateOrganization: (orgId: number, updates: Partial<Organization>) => {
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === orgId ? { ...org, ...updates } : org
          ),
        }));
      },

      deleteOrganization: (orgId: number) => {
        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== orgId),
        }));
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      resetStore: () => {
        set({
          organizations: [],
          loading: false,
          initialized: false,
          lastFetch: null,
          error: null,
        });
      },
    }),
    {
      name: "organizations-storage",
      partialize: (state) => ({
        organizations: state.organizations,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
