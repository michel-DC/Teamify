import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types pour les organisations
interface Organization {
  id: number;
  name: string;
  bio?: string;
  profileImage: string;
  memberCount: number;
  organizationType:
    | "ASSOCIATION"
    | "PME"
    | "ENTREPRISE"
    | "STARTUP"
    | "AUTO_ENTREPRENEUR"
    | string;
  mission: string;
  location?: {
    city: string;
    lat: number;
    lon: number;
    displayName?: string;
  } | null;
  members?: any[] | null;
  createdAt: string;
}

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
}

interface OrganizationsStore {
  // État
  organizations: Organization[];
  events: Event[];
  loading: boolean;
  initialized: boolean;
  lastFetch: number | null;
  error: string | null;

  // Actions
  fetchOrganizations: () => Promise<void>;
  addOrganization: (organization: Organization) => void;
  updateOrganization: (orgId: number, updates: Partial<Organization>) => void;
  deleteOrganization: (orgId: number) => void;
  setLoading: (loading: boolean) => void;
  resetStore: () => void;
}

// Durée de validité du cache (10 minutes pour les organisations)
const CACHE_DURATION = 10 * 60 * 1000;

export const useOrganizationsStore = create<OrganizationsStore>()(
  persist(
    (set, get) => ({
      // État initial
      organizations: [],
      events: [],
      loading: false,
      initialized: false,
      lastFetch: null,
      error: null,

      // Action pour récupérer les organisations
      fetchOrganizations: async () => {
        const { initialized, lastFetch } = get();

        // Vérifier si les données sont déjà initialisées et récentes
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

      // Action pour ajouter une organisation
      addOrganization: (organization: Organization) => {
        set((state) => ({
          organizations: [organization, ...state.organizations],
        }));
      },

      // Action pour mettre à jour une organisation
      updateOrganization: (orgId: number, updates: Partial<Organization>) => {
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === orgId ? { ...org, ...updates } : org
          ),
        }));
      },

      // Action pour supprimer une organisation
      deleteOrganization: (orgId: number) => {
        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== orgId),
        }));
      },

      // Action pour définir l'état de chargement
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // Action pour réinitialiser le store
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
      name: "organizations-storage", // Nom de la clé dans localStorage
      partialize: (state) => ({
        organizations: state.organizations,
        initialized: state.initialized,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
