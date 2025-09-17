"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  UserPlus,
  Building2,
  MessageCircle,
  Users,
  GalleryVerticalEnd,
} from "lucide-react";

import { NavGroups } from "@/components/nav-groups";
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
import { useSidebarData } from "@/hooks/useSidebarData";
// import Image from "next/image";

// Mapping des icônes pour les éléments de navigation
const iconMap = {
  LayoutDashboard,
  Calendar,
  Plus,
  UserPlus,
  Building2,
  MessageCircle,
  Users,
  GalleryVerticalEnd,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Utilisation du hook personnalisé pour les données de la sidebar
  const { data } = useSidebarData();

  // Transformation des données pour les équipes avec icônes
  const teamsWithIcons = data.teams.map((team) => ({
    ...team,
    logo: iconMap[team.logo as keyof typeof iconMap] || GalleryVerticalEnd,
  }));

  // Transformation des données pour les événements avec icônes
  const eventsWithIcons = data.events.map((event) => ({
    name: event.title,
    url: event.url,
    icon: iconMap[event.icon as keyof typeof iconMap] || Calendar,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* <div className="flex justify-center items-center">
        <Image
          src="/images/logo/favicon.svg"
          alt="Logo"
          width={32}
          height={32}
        />
      </div> */}
      <SidebarHeader>
        <TeamSwitcher teams={teamsWithIcons} />
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <NavGroups groups={data.navGroups} iconMap={iconMap} />
        <NavEvents events={eventsWithIcons} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
