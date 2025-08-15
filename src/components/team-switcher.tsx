"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useOrganizationsStore } from "@/store/organizationsStore";
import { useEventsStore } from "@/store/eventsStore";
import { GalleryVerticalEnd } from "lucide-react";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
  }[];
}) {
  const { activeOrganization, setActiveOrganization } = useActiveOrganization();
  const { organizations } = useOrganizationsStore();
  const { fetchEvents } = useEventsStore();

  const isMobile = useIsMobile();
  const [profileImage, setProfileImage] = React.useState<string | null>(null);

  /**
   * Récupère l'image de profil de l'organisation active
   */
  React.useEffect(() => {
    const fetchProfileImage = async () => {
      if (!activeOrganization) return;

      try {
        const response = await fetch(
          `/api/organization/${activeOrganization.publicId}/profile-image`
        );
        const data = await response.json();
        setProfileImage(data.profileImage);
      } catch (error) {
        console.error("Error fetching profile image:", error);
        setProfileImage(null);
      }
    };

    fetchProfileImage();
  }, [activeOrganization]);

  /**
   * Gère le changement d'organisation
   */
  const handleOrganizationChange = async (organization: any) => {
    setActiveOrganization(organization);

    // Recharger les événements pour la nouvelle organisation
    try {
      await fetchEvents();
    } catch (error) {
      console.error("Erreur lors du rechargement des événements:", error);
    }
  };

  // Trouver l'organisation active correspondante
  const currentActiveTeam = activeOrganization
    ? teams.find((team) => team.name === activeOrganization.name) || teams[0]
    : teams[0];

  if (!currentActiveTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={currentActiveTeam.name}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <currentActiveTeam.logo className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentActiveTeam.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Vos organisations
            </DropdownMenuLabel>
            {organizations.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleOrganizationChange(org)}
                className={`gap-2 p-2 ${
                  activeOrganization?.id === org.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {org.profileImage ? (
                    <Image
                      src={org.profileImage}
                      alt={org.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <GalleryVerticalEnd className="h-6 w-6" />
                  )}
                </div>
                {org.name}
                {activeOrganization?.id === org.id && (
                  <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                <a href="/dashboard/organizations/new">
                  Ajouter une organisation
                </a>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
