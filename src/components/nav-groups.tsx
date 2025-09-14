"use client";

import { type LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavGroup {
  title: string;
  icon: string;
  items: {
    title: string;
    url: string;
    icon: string;
    isActive: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}

interface NavGroupsProps {
  groups: NavGroup[];
  iconMap: Record<string, LucideIcon>;
}

export function NavGroups({ groups, iconMap }: NavGroupsProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex flex-col gap-2 p-0.5">
      {groups.map((group, groupIndex) => {
        const GroupIconComponent =
          iconMap[group.icon] || iconMap["LayoutDashboard"];

        return (
          <div key={group.title} className="flex flex-col gap-1">
            {/* Titre du groupe (optionnel, peut être masqué) */}
            {group.title !== "Navigation principale" && !isCollapsed && (
              <div className="px-2 py-1">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h3>
              </div>
            )}

            {/* Icône du groupe (affichée uniquement quand collapsed) */}
            {isCollapsed && group.title !== "Navigation principale" && (
              <div className="flex justify-center py-2">
                <GroupIconComponent className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            {/* Boutons du groupe */}
            <SidebarMenuSub>
              {group.items.map((item) => {
                const IconComponent =
                  iconMap[item.icon] || iconMap["LayoutDashboard"];

                return (
                  <SidebarMenuSubItem key={item.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={item.isActive}
                      className="flex items-center gap-3 py-4 px-1"
                    >
                      <a href={item.url}>
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>

            {/* Séparateur entre les groupes (sauf pour le dernier) */}
            {groupIndex < groups.length - 1 && !isCollapsed && (
              <Separator className="my-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
