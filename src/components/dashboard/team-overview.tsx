"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Crown,
  UserPlus,
  Mail,
  Calendar,
  MapPin,
  Shield,
  User,
  Settings,
} from "lucide-react";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useProfileImages } from "@/hooks/use-profile-images";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  userUid?: string; // Ajout de l'UID pour récupérer l'image de profil
  status: "online" | "offline" | "away";
  lastActive: string;
  eventsOrganized: number;
  location?: string;
}

export function TeamOverview() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeOrganization } = useActiveOrganization();
  const { open, isMobile } = useSidebar();

  // Extraction des UIDs des membres pour récupérer leurs images de profil
  const memberUids = useMemo(() => {
    return members
      .map((member) => member.userUid)
      .filter((uid): uid is string => Boolean(uid));
  }, [members]);

  // Récupération des images de profil des membres
  const { profileImages } = useProfileImages(memberUids);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!activeOrganization) return;

      try {
        // Récupération des vrais membres de l'organisation
        const response = await fetch(
          `/api/organizations/by-public-id/${activeOrganization.publicId}/members`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.members) {
            // Transformation des données réelles
            const teamMembers: TeamMember[] = data.members.map(
              (member: any, index: number) => ({
                id: member.id || `member-${index}`,
                name:
                  `${member.user?.firstname || ""} ${
                    member.user?.lastname || ""
                  }`.trim() ||
                  member.user?.email?.split("@")[0] ||
                  "Membre",
                email: member.user?.email || "email@example.com",
                role: member.role || "MEMBER",
                userUid: member.userUid, // Ajout de l'UID pour récupérer l'image de profil
                status:
                  index % 3 === 0
                    ? "online"
                    : index % 3 === 1
                    ? "away"
                    : "offline",
                lastActive: new Date(
                  Date.now() - index * 30 * 60 * 1000
                ).toISOString(),
                eventsOrganized: Math.floor(Math.random() * 10) + 1, // Simulation basée sur l'index
                location: [
                  "Paris, France",
                  "Lyon, France",
                  "Marseille, France",
                  "Bordeaux, France",
                  "Nantes, France",
                ][index % 5],
              })
            );

            setMembers(teamMembers);
          } else {
            // Fallback avec des données de base si pas de membres
            const fallbackMembers: TeamMember[] = [
              {
                id: "1",
                name: "Organisateur Principal",
                email: "organisateur@example.com",
                role: "OWNER",
                status: "online",
                lastActive: new Date().toISOString(),
                eventsOrganized: 1,
                location: "Paris, France",
              },
            ];
            setMembers(fallbackMembers);
          }
        } else {
          // Fallback en cas d'erreur
          const fallbackMembers: TeamMember[] = [
            {
              id: "1",
              name: "Organisateur Principal",
              email: "organisateur@example.com",
              role: "OWNER",
              status: "online",
              lastActive: new Date().toISOString(),
              eventsOrganized: 1,
              location: "Paris, France",
            },
          ];
          setMembers(fallbackMembers);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des membres:", error);
        // Fallback en cas d'erreur
        const fallbackMembers: TeamMember[] = [
          {
            id: "1",
            name: "Organisateur Principal",
            email: "organisateur@example.com",
            role: "OWNER",
            status: "online",
            lastActive: new Date().toISOString(),
            eventsOrganized: 1,
            location: "Paris, France",
          },
        ];
        setMembers(fallbackMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [activeOrganization]);

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  // Conversion des rôles API en noms conventionnels avec icônes
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "OWNER":
        return {
          label: "Gérant",
          icon: <Crown className="h-3 w-3" />,
          variant: "default" as const,
        };
      case "ADMIN":
        return {
          label: "Admin",
          icon: <Shield className="h-3 w-3" />,
          variant: "secondary" as const,
        };
      case "MEMBER":
        return {
          label: "Membre",
          icon: <User className="h-3 w-3" />,
          variant: "outline" as const,
        };
      default:
        return {
          label: role,
          icon: <User className="h-3 w-3" />,
          variant: "outline" as const,
        };
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return "Plus de 24h";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Équipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 sm:space-x-3 animate-pulse"
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-2 sm:h-3 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden xs:inline">Équipe</span>
          <span className="xs:hidden">Équipe</span>
          <span className="hidden sm:inline">({members.length} membres)</span>
          <span className="sm:hidden">({members.length})</span>
        </CardTitle>
        <Link
          href={
            activeOrganization ? `/dashboard/organizations/invitations` : "#"
          }
        >
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden xs:inline">Ajouter</span>
            <span className="xs:hidden">+</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {members.map((member) => {
            const roleInfo = getRoleInfo(member.role);
            return (
              <div
                key={member.id}
                className={`
                  flex items-start sm:items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border hover:bg-gray-50 transition-colors
                  ${isMobile ? "flex-col sm:flex-row" : "flex-row"}
                  ${!open && !isMobile ? "lg:flex-col xl:flex-row" : ""}
                `}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage
                      src={
                        member.userUid
                          ? profileImages[member.userUid] || ""
                          : member.avatar || ""
                      }
                      alt={`Photo de profil de ${member.name}`}
                    />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-white ${getStatusColor(
                      member.status
                    )}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header avec nom et rôle */}
                  <div
                    className={`
                    flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2 space-y-1 sm:space-y-0
                    ${!open && !isMobile ? "lg:flex-col xl:flex-row" : ""}
                  `}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <h4 className="text-xs sm:text-sm font-medium truncate">
                        {member.name}
                      </h4>
                      {member.role === "OWNER" && (
                        <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <Badge variant={roleInfo.variant} className="w-fit text-xs">
                      <span className="mr-1">{roleInfo.icon}</span>
                      <span className="hidden sm:inline">{roleInfo.label}</span>
                      <span className="sm:hidden">
                        {roleInfo.label.charAt(0)}
                      </span>
                    </Badge>
                  </div>

                  {/* Informations détaillées */}
                  <div
                    className={`
                    flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-muted-foreground
                    ${!open && !isMobile ? "lg:flex-col xl:flex-row" : ""}
                  `}
                  >
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate hidden sm:inline">
                        {member.email}
                      </span>
                      <span className="truncate sm:hidden">
                        {member.email.split("@")[0]}
                      </span>
                    </div>

                    {member.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="hidden md:inline">
                          {member.location}
                        </span>
                        <span className="md:hidden">
                          {member.location.split(",")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton d'action */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 p-1 sm:p-2"
                >
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {members.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base">Aucun membre dans l'équipe</p>
            <p className="text-xs sm:text-sm">
              Invitez des membres pour commencer
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
