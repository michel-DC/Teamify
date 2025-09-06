"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { AutoSignedImage } from "@/components/ui/auto-signed-image";

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
import { forceRefreshAllStores } from "@/store/activeOrganizationStore";

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
  const [organizationName, setOrganizationName] = React.useState<string>("");

  /**
   * Récupère l'image de profil et le nom de l'organisation active
   */
  React.useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!activeOrganization) return;

      try {
        const response = await fetch(
          `/api/organizations/by-public-id/${activeOrganization.publicId}/profile-image`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfileImage(data.profileImage);
        setOrganizationName(data.name || activeOrganization.name);
      } catch (error) {
        console.error("Error fetching organization data:", error);
        // En cas d'erreur, utiliser les données de l'organisation active directement
        setProfileImage(activeOrganization.profileImage);
        setOrganizationName(activeOrganization.name);
      }
    };

    fetchOrganizationData();
  }, [activeOrganization]);

  /**
   * Gère le changement d'organisation
   */
  const handleOrganizationChange = async (organization: any) => {
    // Mettre à jour l'organisation active
    // La suppression du localStorage sidebar-storage est gérée automatiquement dans setActiveOrganization
    setActiveOrganization(organization);

    // Forcer un refresh complet de tous les stores
    // Cela garantit que toutes les données sont rechargées pour la nouvelle organisation
    setTimeout(() => {
      forceRefreshAllStores();
    }, 100); // Petit délai pour s'assurer que l'organisation active est bien mise à jour
  };

  // Utiliser le nom de l'organisation récupéré via l'API ou le nom par défaut
  const displayName =
    organizationName || activeOrganization?.name || "Mon Organisation";

  if (!activeOrganization) {
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
                  <div className="w-4 h-4">
                    <AutoSignedImage
                      src={profileImage}
                      alt={displayName}
                      className="rounded-full w-full h-full"
                      errorComponent={
                        <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                          <GalleryVerticalEnd className="size-3 text-muted-foreground" />
                        </div>
                      }
                      loadingComponent={
                        <div className="w-full h-full flex items-center justify-center bg-muted rounded-full animate-pulse">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <GalleryVerticalEnd className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
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
                    <div className="w-6 h-6">
                      <AutoSignedImage
                        src={org.profileImage}
                        alt={org.name}
                        className="rounded-full w-full h-full"
                        errorComponent={
                          <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                            <GalleryVerticalEnd className="size-4 text-muted-foreground" />
                          </div>
                        }
                        loadingComponent={
                          <div className="w-full h-full flex items-center justify-center bg-muted rounded-full animate-pulse">
                            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                          </div>
                        }
                      />
                    </div>
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
                  Créer une organisation
                </a>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
