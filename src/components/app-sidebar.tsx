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
  MoreHorizontal,
  Settings,
  HelpCircle,
  Download,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSidebarData } from "@/hooks/useSidebarData";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { SidebarSearch } from "./sidebar-search";
import { TeamSwitcher } from "./team-switcher";
import { SidebarStatsCard } from "./sidebar-stats-card";

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
  MoreHorizontal,
  Settings,
  HelpCircle,
  Download,
  Upload,
  FileText,
  Trash2,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Utilisation du hook personnalisé pour les données de la sidebar
  const { data } = useSidebarData();

  // Transformation des données pour NavMain (groupes avec sous-groupes)
  const navMainItems = data.navGroups.map((group) => ({
    title: group.title,
    url: "#",
    icon: iconMap[group.icon as keyof typeof iconMap] || LayoutDashboard,
    isActive: group.items.some((item) => item.isActive),
    items: group.items.map((item) => ({
      title: item.title,
      url: item.url,
    })),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={data.teams.map((team) => ({
            ...team,
            logo:
              iconMap[team.logo as keyof typeof iconMap] || GalleryVerticalEnd,
          }))}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarSearch />
        <NavMain items={navMainItems} />
        <SidebarStatsCard />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
