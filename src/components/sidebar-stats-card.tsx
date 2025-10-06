"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useSidebar } from "@/components/ui/sidebar";

interface OrganizationStats {
  userRole: string;
  memberCount: number;
  invitationsLast30Days: number;
  eventsCount: number;
}

export function SidebarStatsCard() {
  const { activeOrganization } = useActiveOrganization();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [stats, setStats] = useState<OrganizationStats>({
    userRole: "",
    memberCount: 0,
    invitationsLast30Days: 0,
    eventsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeOrganization) return;

      setIsLoading(true);
      try {
        // Récupérer les stats de l'organisation en utilisant les vrais endpoints
        console.log(
          "SidebarStatsCard: Récupération des stats pour l'organisation:",
          activeOrganization.publicId
        );

        const [statsResponse, invitationsResponse] = await Promise.all([
          fetch(
            `/api/dashboard/organizations/stats?organizationPublicId=${activeOrganization.publicId}`
          ),
          fetch(
            `/api/organizations/by-public-id/${activeOrganization.publicId}/invitations`
          ),
        ]);

        console.log(
          "SidebarStatsCard: Réponses reçues - Stats:",
          statsResponse.status,
          "Invitations:",
          invitationsResponse.status
        );

        const [statsData, invitationsData] = await Promise.all([
          statsResponse.ok
            ? statsResponse.json()
            : { stats: { userRole: "MEMBER", memberCount: 0, eventsCount: 0 } },
          invitationsResponse.ok
            ? invitationsResponse.json()
            : { invitations: [] },
        ]);

        console.log(
          "SidebarStatsCard: Données reçues - Stats:",
          statsData,
          "Invitations:",
          invitationsData
        );

        // L'API stats retourne maintenant les données de l'organisation active
        console.log(
          "SidebarStatsCard: Organisation active:",
          activeOrganization
        );

        // Calculer les invitations des 30 derniers jours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const invitationsLast30Days =
          invitationsData.invitations?.filter((inv: any) => {
            const invitationDate = new Date(inv.createdAt);
            return invitationDate >= thirtyDaysAgo;
          }).length || 0;

        console.log(
          "SidebarStatsCard: Stats calculées - Invitations 30j:",
          invitationsLast30Days
        );

        setStats({
          userRole: statsData.stats?.userRole || "MEMBER",
          memberCount: statsData.stats?.memberCount || 0,
          invitationsLast30Days: invitationsLast30Days,
          eventsCount: statsData.stats?.eventsCount || 0,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [activeOrganization]);

  // Ne pas afficher la card si la sidebar est collapsed
  if (isCollapsed) {
    return null;
  }

  if (!activeOrganization || isLoading) {
    return (
      <Card className="mx-2 mb-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Chargement...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "ADMIN":
        return "secondary";
      case "MEMBER":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Propriétaire";
      case "ADMIN":
        return "Administrateur";
      case "MEMBER":
        return "Membre";
      default:
        return "Membre";
    }
  };

  return (
    <Card className="mx-2 mb-0">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium">Statistiques</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Rôle de l'utilisateur */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Votre rôle</span>
            <Badge
              variant={getRoleBadgeVariant(stats.userRole)}
              className="text-xs"
            >
              {getRoleLabel(stats.userRole)}
            </Badge>
          </div>

          {/* Séparateur */}
          <div className="border-t border-border" />

          {/* Nombre de membres */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Membres</span>
            <span className="text-xs font-medium" style={{ color: "#7C3AED" }}>
              {stats.memberCount}
            </span>
          </div>

          {/* Séparateur */}
          <div className="border-t border-border" />

          {/* Invitations 30 derniers jours */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Invitations (30j)
            </span>
            <span className="text-xs font-medium" style={{ color: "#7C3AED" }}>
              {stats.invitationsLast30Days}
            </span>
          </div>

          {/* Séparateur */}
          <div className="border-t border-border" />

          {/* Nombre d'événements */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Événements</span>
            <span className="text-xs font-medium" style={{ color: "#7C3AED" }}>
              {stats.eventsCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
