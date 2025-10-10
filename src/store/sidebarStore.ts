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
  logo: string;
}

interface Event {
  title: string;
  url: string;
  icon: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface SidebarGroup {
  title: string;
  icon: string;
  items: NavItem[];
}

interface SidebarData {
  user: User;
  teams: Team[];
  events: Event[];
  navGroups: SidebarGroup[];
}

interface SidebarStore {
  // État
  data: SidebarData;
  loading: boolean;
  initialized: boolean;
  lastFetch: number | null;
  error: string | null;

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
  navGroups: [
    {
      title: "Navigation principale",
      icon: "LayoutDashboard",
      items: [
        {
          title: "Tableau de bord",
          url: "/dashboard",
          icon: "LayoutDashboard",
          isActive: true,
          items: [
            {
              title: "Vue d'ensemble",
              url: "/dashboard",
            },
          ],
        },
      ],
    },
    {
      title: "Événements",
      icon: "Calendar",
      items: [
        {
          title: "Tous les événements",
          url: "/dashboard/events",
          icon: "Calendar",
          isActive: false,
        },
        {
          title: "Créer un événement",
          url: "/dashboard/events/new",
          icon: "Plus",
          isActive: false,
        },
        {
          title: "Gestion des invitations",
          url: "/dashboard/events/invitations",
          icon: "UserPlus",
          isActive: false,
        },
      ],
    },
    {
      title: "Organisations",
      icon: "Building2",
      items: [
        {
          title: "Mes organisations",
          url: "/dashboard/organizations",
          icon: "Building2",
          isActive: false,
        },
        {
          title: "Créer une organisation",
          url: "/dashboard/organizations/new",
          icon: "Plus",
          isActive: false,
        },
        {
          title: "Inviter un membre",
          url: "/dashboard/organizations/invitations",
          icon: "UserPlus",
          isActive: false,
        },
      ],
    },
    {
      title: "Messagerie",
      icon: "MessageCircle",
      items: [
        {
          title: "Messages privés",
          url: "/dashboard/messages",
          icon: "MessageCircle",
          isActive: false,
        },
        {
          title: "Groupes d'organisations",
          url: "/dashboard/messages/groups",
          icon: "Users",
          isActive: false,
        },
      ],
    },
    {
      title: "Autres",
      icon: "MoreHorizontal",
      items: [
        {
          title: "Paramètres",
          url: "/dashboard/settings",
          icon: "Settings",
          isActive: false,
        },
        {
          title: "Aide & Support",
          url: "/dashboard/help",
          icon: "HelpCircle",
          isActive: false,
        },
        {
          title: "Exporter les données",
          url: "/dashboard/export",
          icon: "Download",
          isActive: false,
        },
        {
          title: "Importer des données",
          url: "/dashboard/import",
          icon: "Upload",
          isActive: false,
        },
        {
          title: "Rapports",
          url: "/dashboard/reports",
          icon: "FileText",
          isActive: false,
        },
        {
          title: "Corbeille",
          url: "/dashboard/trash",
          icon: "Trash2",
          isActive: false,
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
      loading: false as boolean,
      initialized: false as boolean,
      lastFetch: null as number | null,
      error: null as string | null,

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
          // Récupérer l'organisation active
          let activeOrgPublicId: string | null = null;
          try {
            const activeOrgStorage = localStorage.getItem(
              "active-organization-storage"
            );
            if (activeOrgStorage) {
              const parsed = JSON.parse(activeOrgStorage);
              activeOrgPublicId = parsed.state?.activeOrganization?.publicId;
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération de l'organisation active:",
              error
            );
          }

          // Récupérer les données utilisateur et événements en parallèle
          const [userResponse, eventsResponse] = await Promise.all([
            fetch("/api/dashboard"),
            activeOrgPublicId
              ? fetch(
                  `/api/dashboard/events/data?organizationId=${activeOrgPublicId}`
                )
              : Promise.resolve({
                  ok: false,
                  json: () => Promise.resolve({ events: [] }),
                }),
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
            processedEvents = eventsData.events
              .slice(0, 5)
              .map((event: any) => ({
                title: event.title,
                url: `/dashboard/events/details/${event.eventCode}`,
                icon: "Calendar",
              }));
          }

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
          set({
            loading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
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
          error: null,
        });
      },
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        data: state.data,
        initialized: state.initialized,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
