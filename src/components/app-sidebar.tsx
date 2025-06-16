"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Calendar,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavEvents } from "@/components/nav-events";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  teams: [
    {
      name: "",
      profileImage: "",
    },
  ],
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: PieChart,
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
      url: "dashboard/events",
      icon: Calendar,
      isActive: true,
      items: [
        {
          title: "Tous les événements",
          url: "dashboard/events",
        },
        {
          title: "Créer un événement",
          url: "dashboard/events/new",
        },
        {
          title: "Progression",
          url: "dashboard/event/progress",
        },
        {
          title: "Mes invitations",
          url: "dashboard/events/invitations",
        },
      ],
    },
    {
      title: "Organisations",
      url: "/organizations",
      icon: GalleryVerticalEnd,
      isActive: true,
      items: [
        {
          title: "Mes organisations",
          url: "dashboard/organizations",
        },
        {
          title: "Créer une organisation",
          url: "dashboard/organizations/new",
        },
        {
          title: "Inviter un membre",
          url: "dashboard/organizations/invite",
        },
      ],
    },
    {
      title: "Équipes",
      url: "/teams",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Toutes les équipes",
          url: "dashboard/teams",
        },
        {
          title: "Créer une équipe",
          url: "dashboard/teams/new",
        },
        {
          title: "Gérer les membres",
          url: "dashboard/teams/members",
        },
      ],
    },
    {
      title: "Messages",
      url: "/messages",
      icon: Command,
      isActive: false,
      items: [
        {
          title: "Discussions",
          url: "dashboard/messages",
        },
        {
          title: "Nouveau message",
          url: "dashboard/messages/new",
        },
      ],
    },
    {
      title: "Paramètres",
      url: "/settings",
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: "Profil",
          url: "dashboard/settings/profile",
        },
        {
          title: "Notifications",
          url: "dashboard/settings/notifications",
        },
        {
          title: "Sécurité",
          url: "dashboard/settings/security",
        },
        {
          title: "Facturation",
          url: "dashboard/settings/billing",
        },
      ],
    },
  ],
  events: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = React.useState(data);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const dashboardData = await res.json();

        if (dashboardData && dashboardData[0]) {
          const user = dashboardData[0];
          setUserData((prev) => ({
            ...prev,
            user: {
              name: user.name,
              email: user.email,
              avatar: user.profilePicture || "",
            },
            teams: [
              {
                name: user.organization?.name || "Mon Organisation",
                profileImage: user.organization?.profileImage || "",
              },
            ],
          }));
        }
      } catch (error) {
        console.error(
          "Impossible de fetch les données, ressayer plus tard.",
          error
        );
      }
    };

    fetchData();
  }, []);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/dashboard/events/data");
        const data = await response.json();

        if (data.events) {
          const lastThreeEvents = data.events.slice(-3).map((event: any) => ({
            name: event.title,
            url: "#",
            icon: Calendar,
          }));

          setUserData((prev) => ({
            ...prev,
            events: lastThreeEvents,
          }));
        }
      } catch (error) {
        console.error("Impossible de fetch les données, ressayer plus tard.");
      }
    };

    fetchEvents();
  }, []);

  const [profileImage, setProfileImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetch("/api/organization/profile-image");
        const data = await response.json();
        setProfileImage(data.profileImage);
      } catch (error) {
        console.error("Impossible de fetch les données, ressayer plus tard.");
      }
    };

    fetchProfileImage();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={userData.teams.map((team) => ({
            name: team.name,
            logo: profileImage
              ? () => (
                  <img
                    src={profileImage}
                    alt={team.name}
                    className="size-4 rounded-full"
                  />
                )
              : GalleryVerticalEnd,
          }))}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={userData.navMain} />
        <NavEvents events={userData.events} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
