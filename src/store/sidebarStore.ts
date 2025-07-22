import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types pour les données de la sidebar
interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Team {
  name: string;
  logo: string; // Nom de l'icône comme chaîne
}

interface Event {
  name: string;
  url: string;
  icon: string; // Nom de l'icône comme chaîne
}

interface NavItem {
  title: string;
  url: string;
  icon?: string; // Nom de l'icône comme chaîne
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface SidebarData {
  user: User;
  teams: Team[];
  events: Event[];
  navMain: NavItem[];
}

interface SidebarStore {
  // État
  data: SidebarData;
  loading: boolean;
  initialized: boolean;
  lastFetch: number | null;

  // Actions
  fetchSidebarData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  resetStore: () => void;
}

// Données initiales
const initialData: SidebarData = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  teams: [
    {
      name: "",
      logo: "GalleryVerticalEnd",
    },
  ],
  events: [],
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: "PieChart",
      isActive: true,
      items: [
        {
          title: "Vue d'ensemble",
          url: "#",
        },
        {
          title: "Statistiques",
          url: "/dashboard/stats",
        },
      ],
    },
    {
      title: "Événements",
      url: "/dashboard/events",
      icon: "Calendar",
      isActive: true,
      items: [
        {
          title: "Tous les événements",
          url: "/dashboard/events",
        },
        {
          title: "Créer un événement",
          url: "/dashboard/events/new",
        },
        {
          title: "Mes invitations",
          url: "/dashboard/events/invitations",
        },
      ],
    },
    {
      title: "Organisations",
      url: "/organizations",
      icon: "GalleryVerticalEnd",
      isActive: true,
      items: [
        {
          title: "Mes organisations",
          url: "/dashboard/organizations",
        },
        {
          title: "Créer une organisation",
          url: "/dashboard/organizations/new",
        },
        {
          title: "Inviter un membre",
          url: "/dashboard/organizations/invite",
        },
      ],
    },
    {
      title: "Équipes",
      url: "/teams",
      icon: "Users",
      isActive: true,
      items: [
        {
          title: "Toutes les équipes",
          url: "/dashboard/teams",
        },
        {
          title: "Créer une équipe",
          url: "/dashboard/teams/new",
        },
        {
          title: "Gérer les membres",
          url: "/dashboard/teams/members",
        },
      ],
    },
    {
      title: "Messages",
      url: "/messages",
      icon: "Command",
      isActive: false,
      items: [
        {
          title: "Discussions",
          url: "/dashboard/messages",
        },
        {
          title: "Nouveau message",
          url: "/dashboard/messages/new",
        },
      ],
    },
    {
      title: "Paramètres",
      url: "/settings",
      icon: "Settings2",
      isActive: false,
      items: [
        {
          title: "Profil",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Notifications",
          url: "/dashboard/settings/notifications",
        },
        {
          title: "Sécurité",
          url: "/dashboard/settings/security",
        },
        {
          title: "Facturation",
          url: "/dashboard/settings/billing",
        },
      ],
    },
  ],
};

// Durée de validité du cache (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      // État initial
      data: initialData,
      loading: false,
      initialized: false,
      lastFetch: null,

      // Action pour récupérer les données de la sidebar
      fetchSidebarData: async () => {
        const { initialized, lastFetch } = get();

        // Vérifier si les données sont déjà initialisées et récentes
        if (
          initialized &&
          lastFetch &&
          Date.now() - lastFetch < CACHE_DURATION
        ) {
          return;
        }

        set({ loading: true });

        try {
          // Récupérer les données utilisateur et événements en parallèle
          const [userResponse, eventsResponse] = await Promise.all([
            fetch("/api/dashboard"),
            fetch("/api/dashboard/events/data"),
          ]);

          if (!userResponse.ok) {
            throw new Error(
              "Erreur lors de la récupération des données utilisateur"
            );
          }

          const userData = await userResponse.json();
          const eventsData = await eventsResponse.json();

          // Traiter les données utilisateur
          let processedUserData = initialData;
          if (userData && userData[0]) {
            const user = userData[0];
            processedUserData = {
              ...initialData,
              user: {
                name: user.name || "",
                email: user.email || "",
                avatar: user.profilePicture || "",
              },
              teams: [
                {
                  name: user.organization?.name || "Mon Organisation",
                  logo: "GalleryVerticalEnd",
                },
              ],
            };
          }

          // Traiter les données d'événements
          let processedEvents: Event[] = [];
          if (eventsData && eventsData.events) {
            processedEvents = eventsData.events.slice(-3).map((event: any) => ({
              name: event.title,
              url: "#",
              icon: "Calendar",
            }));
          }

          // Mettre à jour le store
          set({
            data: {
              ...processedUserData,
              events: processedEvents,
            },
            loading: false,
            initialized: true,
            lastFetch: Date.now(),
          });
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données de la sidebar:",
            error
          );
          set({ loading: false });
        }
      },

      // Action pour définir l'état de chargement
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // Action pour réinitialiser le store
      resetStore: () => {
        set({
          data: initialData,
          loading: false,
          initialized: false,
          lastFetch: null,
        });
      },
    }),
    {
      name: "sidebar-storage", // Nom de la clé dans localStorage
      partialize: (state) => ({
        data: state.data,
        initialized: state.initialized,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
