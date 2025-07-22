import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types pour les événements
interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  status: string;
  budget?: number;
  category: string;
  isPublic: boolean;
  isCancelled: boolean;
  createdAt: string;
  organization?: {
    id: number;
    name: string;
  };
}

interface EventsStore {
  // État
  events: Event[];
  loading: boolean;
  initialized: boolean;
  lastFetch: number | null;
  error: string | null;

  // Actions
  fetchEvents: () => Promise<void>;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  setLoading: (loading: boolean) => void;
  resetStore: () => void;
}

// Durée de validité du cache (2 minutes pour les événements)
const CACHE_DURATION = 2 * 60 * 1000;

export const useEventsStore = create<EventsStore>()(
  persist(
    (set, get) => ({
      // État initial
      events: [],
      loading: false,
      initialized: false,
      lastFetch: null,
      error: null,

      // Action pour récupérer les événements
      fetchEvents: async () => {
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
          const response = await fetch("/api/dashboard/events/data");

          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des événements");
          }

          const data = await response.json();

          set({
            events: data.events || [],
            loading: false,
            initialized: true,
            lastFetch: Date.now(),
            error: null,
          });
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des événements:",
            error
          );
          set({
            loading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
        }
      },

      // Action pour ajouter un événement
      addEvent: (event: Event) => {
        set((state) => ({
          events: [event, ...state.events],
        }));
      },

      // Action pour mettre à jour un événement
      updateEvent: (eventId: string, updates: Partial<Event>) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId ? { ...event, ...updates } : event
          ),
        }));
      },

      // Action pour supprimer un événement
      deleteEvent: (eventId: string) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
        }));
      },

      // Action pour définir l'état de chargement
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // Action pour réinitialiser le store
      resetStore: () => {
        set({
          events: [],
          loading: false,
          initialized: false,
          lastFetch: null,
          error: null,
        });
      },
    }),
    {
      name: "events-storage", // Nom de la clé dans localStorage
      partialize: (state) => ({
        events: state.events,
        initialized: state.initialized,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
