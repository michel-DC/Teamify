"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Settings,
  Users,
  LogOut,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { AutoSignedImage } from "@/components/ui/auto-signed-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { Organization } from "../types";

interface OrganizationsSectionProps {
  organizations: Organization[];
  onOrganizationUpdate?: () => void;
}

/**
 * Formatage du rôle de l'utilisateur dans l'organisation
 * avec des couleurs et labels appropriés
 */
const getRoleDisplay = (role: string) => {
  switch (role) {
    case "OWNER":
      return {
        label: "Propriétaire",
        variant: "default" as const,
        className: "bg-red-100 text-red-800 border-red-200",
      };
    case "ADMIN":
      return {
        label: "Administrateur",
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "MEMBER":
      return {
        label: "Membre",
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
    default:
      return {
        label: role,
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
  }
};

export function OrganizationsSection({
  organizations,
  onOrganizationUpdate,
}: OrganizationsSectionProps) {
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );

  /**
   * Gestion de la sortie d'une organisation
   */
  const handleLeaveOrganization = async (organizationId: number) => {
    setLoadingStates((prev) => ({ ...prev, [organizationId]: true }));

    try {
      const response = await fetch("/api/organizations/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        toast.success("Vous avez quitté l'organisation avec succès");
        onOrganizationUpdate?.();
      } else {
        const error = await response.json();
        toast.error(
          error.error || "Erreur lors de la sortie de l'organisation"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la sortie:", error);
      toast.error("Erreur lors de la sortie de l'organisation");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [organizationId]: false }));
    }
  };

  /**
   * Gestion de la suppression d'une organisation
   */
  const handleDeleteOrganization = async (organizationId: number) => {
    setLoadingStates((prev) => ({ ...prev, [organizationId]: true }));

    try {
      const response = await fetch("/api/organizations/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        toast.success("Organisation supprimée avec succès");
        onOrganizationUpdate?.();
      } else {
        const error = await response.json();
        toast.error(
          error.error || "Erreur lors de la suppression de l'organisation"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'organisation");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [organizationId]: false }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {organizations.length === 0 ? (
        <Card className="mx-auto max-w-md">
          <CardContent className="text-center py-8 px-4 sm:px-8">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">
              Aucune organisation
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Vous n'êtes membre d'aucune organisation pour le moment.
            </p>
            <Button className="w-full sm:w-auto">Créer une organisation</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {organizations.map((org) => {
            const roleDisplay = getRoleDisplay(org.role);
            const isLoading = loadingStates[org.id] || false;

            return (
              <Card
                key={org.id}
                className="hover:shadow-md transition-shadow duration-200 group"
              >
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    {/* Avatar avec image de profil */}
                    <div className="flex-shrink-0">
                      {org.profileImage ? (
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full ring-2 ring-offset-2 ring-gray-100 group-hover:ring-primary/20 transition-all overflow-hidden">
                          <AutoSignedImage
                            src={org.profileImage}
                            alt={`Logo de ${org.name}`}
                            className="w-full h-full object-cover"
                            fallbackSrc=""
                            errorComponent={
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                <span className="text-primary font-semibold text-lg">
                                  {org.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            }
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-2 ring-offset-2 ring-gray-100 group-hover:ring-primary/20 transition-all">
                          <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Informations de l'organisation */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <CardTitle className="text-sm sm:text-base font-semibold truncate leading-tight">
                        {org.name}
                      </CardTitle>

                      {/* Badge du rôle */}
                      <Badge
                        variant={roleDisplay.variant}
                        className={`text-xs px-2 py-1 font-medium ${roleDisplay.className} w-fit`}
                      >
                        {roleDisplay.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 sm:px-6 pt-0">
                  <div className="flex items-center justify-between">
                    {/* Nombre de membres */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium">
                        {org.memberCount} membre{org.memberCount > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Menu des actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                          title="Actions de l'organisation"
                          disabled={isLoading}
                        >
                          <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <a
                            href={`/dashboard/organizations/settings/${org.publicId}`}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Paramètres
                          </a>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Action selon le rôle */}
                        {org.role === "OWNER" ? (
                          <DropdownMenuItem asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <div className="flex items-center w-full cursor-pointer text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer l'organisation
                                </div>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    Supprimer l'organisation
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. Tous les
                                    événements, membres et données associés à
                                    cette organisation seront définitivement
                                    supprimés.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteOrganization(org.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isLoading}
                                  >
                                    {isLoading
                                      ? "Suppression..."
                                      : "Supprimer définitivement"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <div className="flex items-center w-full cursor-pointer text-destructive hover:text-destructive">
                                  <LogOut className="h-4 w-4 mr-2" />
                                  Quitter l'organisation
                                </div>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <LogOut className="h-5 w-5 text-destructive" />
                                    Quitter l'organisation
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir quitter cette
                                    organisation ? Vous perdrez l'accès à tous
                                    les événements et données associés.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleLeaveOrganization(org.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isLoading}
                                  >
                                    {isLoading
                                      ? "Sortie..."
                                      : "Quitter l'organisation"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
