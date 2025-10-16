import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  eventCode: string;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: number;
    name: string;
  };
}

interface EventsStore {
  events: Event[];
  loading: boolean;
  initialized: boolean;
  lastFetch: number | null;
  error: string | null;

  fetchEvents: (organizationId?: string) => Promise<void>;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  setLoading: (loading: boolean) => void;
  resetStore: () => void;
}

const CACHE_DURATION = 2 * 60 * 1000;

export const useEventsStore = create<EventsStore>()(
  persist(
    (set, get) => ({
      events: [],
      loading: false,
      initialized: false,
      lastFetch: null,
      error: null,

      fetchEvents: async (organizationId?: string) => {
        const { initialized, lastFetch } = get();

        if (
          initialized &&
          lastFetch &&
          Date.now() - lastFetch < CACHE_DURATION &&
          !organizationId
        ) {
          return;
        }

        set({ loading: true, error: null });

        try {
          let targetOrgPublicId = organizationId;

          if (!targetOrgPublicId) {
            try {
              const activeOrgStorage = localStorage.getItem(
                "active-organization-storage"
              );
              if (activeOrgStorage) {
                const parsed = JSON.parse(activeOrgStorage);
                targetOrgPublicId = parsed.state?.activeOrganization?.publicId;
              }
            } catch (error) {
              console.error(
                "Erreur lors de la récupération de l'organisation active:",
                error
              );
            }
          }

          if (!targetOrgPublicId) {
            throw new Error("Aucune organisation active sélectionnée");
          }

          const response = await fetch(
            `/api/dashboard/events/data?organizationId=${targetOrgPublicId}`
          );

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

      addEvent: (event: Event) => {
        set((state) => ({
          events: [event, ...state.events],
        }));
      },

      updateEvent: (eventId: string, updates: Partial<Event>) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId ? { ...event, ...updates } : event
          ),
        }));
      },

      deleteEvent: (eventId: string) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
        }));
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

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
      name: "events-storage",
      partialize: (state) => ({
        events: state.events,
        initialized: state.initialized,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
