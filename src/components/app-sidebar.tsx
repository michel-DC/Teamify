"use client";

import * as React from "react";
import {
  PieChart,
  Calendar,
  GalleryVerticalEnd,
  Users,
  Command,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
// import { NavEvents } from "@/components/nav-events";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSidebarData } from "@/hooks/useSidebarData";

// Mapping des icônes pour les éléments de navigation
const iconMap = {
  PieChart,
  Calendar,
  GalleryVerticalEnd,
  Users,
  Command,
  Settings2,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Utilisation du hook personnalisé pour les données de la sidebar
  const { data } = useSidebarData();

  // Transformation des données pour les icônes de navigation
  const navMainWithIcons = data.navMain.map((item) => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap] || PieChart,
  }));

  // Transformation des données pour les équipes avec icônes
  const teamsWithIcons = data.teams.map((team) => ({
    ...team,
    logo: iconMap[team.logo as keyof typeof iconMap] || GalleryVerticalEnd,
  }));

  // Transformation des données pour les événements avec icônes
  const eventsWithIcons = data.events.map((event) => ({
    ...event,
    icon: iconMap[event.icon as keyof typeof iconMap] || Calendar,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamsWithIcons} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithIcons} />
        {/* <NavEvents events={eventsWithIcons} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
