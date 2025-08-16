"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Plus,
  Users,
  Calendar,
  MoreHorizontal,
  Settings,
  MapPin,
  Euro,
  Target,
  Building2,
  Mail,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrganizationStats {
  totalOrganizations: number;
  totalMembers: number;
  totalEvents: number;
  averageEventsPerOrg: number;
  organizationTypes: {
    ASSOCIATION: number;
    PME: number;
    ENTREPRISE: number;
    STARTUP: number;
    AUTO_ENTREPRENEUR: number;
  };
  eventsStats: {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    averageCapacity: number;
    totalInvitations: number;
    averageInvitationsPerEvent: number;
    eventsWithLocation: number;
    eventsWithBudget: number;
    totalBudget: number;
  };
  todosStats: {
    totalTodos: number;
    completedTodos: number;
    pendingTodos: number;
    completionRate: number;
    totalTodoGroups: number;
    averageTodosPerEvent: number;
  };
  temporalStats: {
    organizationsCreatedThisMonth: number;
    organizationsCreatedThisYear: number;
    eventsCreatedThisMonth: number;
    eventsCreatedThisYear: number;
    averageEventsPerOrg: number;
    averageMembersPerOrg: number;
  };
}

export default function OrganizationsDashboardPage() {
  const router = useRouter();
  const { organizations, loading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<OrganizationStats>({
    totalOrganizations: 0,
    totalMembers: 0,
    totalEvents: 0,
    averageEventsPerOrg: 0,
    organizationTypes: {
      ASSOCIATION: 0,
      PME: 0,
      ENTREPRISE: 0,
      STARTUP: 0,
      AUTO_ENTREPRENEUR: 0,
    },
    eventsStats: {
      totalEvents: 0,
      upcomingEvents: 0,
      completedEvents: 0,
      cancelledEvents: 0,
      averageCapacity: 0,
      totalInvitations: 0,
      averageInvitationsPerEvent: 0,
      eventsWithLocation: 0,
      eventsWithBudget: 0,
      totalBudget: 0,
    },
    todosStats: {
      totalTodos: 0,
      completedTodos: 0,
      pendingTodos: 0,
      completionRate: 0,
      totalTodoGroups: 0,
      averageTodosPerEvent: 0,
    },
    temporalStats: {
      organizationsCreatedThisMonth: 0,
      organizationsCreatedThisYear: 0,
      eventsCreatedThisMonth: 0,
      eventsCreatedThisYear: 0,
      averageEventsPerOrg: 0,
      averageMembersPerOrg: 0,
    },
  });

  /**
   * Récupération des statistiques détaillées depuis l'API
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/organizations/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des statistiques:",
          error
        );
      }
    };

    fetchStats();
  }, []);

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.mission.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ASSOCIATION":
        return "Association";
      case "PME":
        return "PME";
      case "ENTREPRISE":
        return "Entreprise";
      case "STARTUP":
        return "Startup";
      case "AUTO_ENTREPRENEUR":
        return "Auto-entrepreneur";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ASSOCIATION":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "PME":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "ENTREPRISE":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "STARTUP":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "AUTO_ENTREPRENEUR":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleSettingsClick = (orgPublicId: string) => {
    router.push(`/dashboard/organizations/settings/${orgPublicId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des organisations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Organisations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Organisations</h2>
            <p className="text-muted-foreground">
              Gérez vos organisations et leurs événements
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push("/dashboard/organizations/invitations")
              }
            >
              <Mail className="mr-2 h-4 w-4" />
              Invitations
            </Button>
            <Button onClick={() => router.push("/dashboard/organizations/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle organisation
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Organisations
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalOrganizations}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.temporalStats.organizationsCreatedThisMonth} ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membres</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.temporalStats.averageMembersPerOrg} en moyenne
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.eventsStats.totalEvents}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.temporalStats.averageEventsPerOrg} par organisation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invitations</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.eventsStats.totalInvitations}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.eventsStats.averageInvitationsPerEvent} par événement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Statistiques des événements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Statut des événements
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">À venir</span>
                <span className="text-sm font-medium text-blue-600">
                  {stats.eventsStats.upcomingEvents}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Terminés</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.eventsStats.completedEvents}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Annulés</span>
                <span className="text-sm font-medium text-red-600">
                  {stats.eventsStats.cancelledEvents}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques des tâches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tâches de préparation
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total</span>
                <span className="text-sm font-medium">
                  {stats.todosStats.totalTodos}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Terminées</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.todosStats.completedTodos}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Taux de complétion</span>
                <span className="text-sm font-medium text-blue-600">
                  {stats.todosStats.completionRate}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques financières */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Budget total
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.eventsStats.totalBudget.toLocaleString("fr-FR")} €
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.eventsStats.eventsWithBudget} événements avec budget
              </p>
            </CardContent>
          </Card>

          {/* Statistiques géographiques */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Événements localisés
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.eventsStats.eventsWithLocation}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {stats.eventsStats.totalEvents} événements
              </p>
            </CardContent>
          </Card>

          {/* Capacité moyenne */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Capacité moyenne
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.eventsStats.averageCapacity}
              </div>
              <p className="text-xs text-muted-foreground">
                personnes par événement
              </p>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Activité ce mois
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Nouvelles org.</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.temporalStats.organizationsCreatedThisMonth}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Nouveaux événements</span>
                <span className="text-sm font-medium text-blue-600">
                  {stats.temporalStats.eventsCreatedThisMonth}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Répartition par type d'organisation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Répartition par type d'organisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {Object.entries(stats.organizationTypes).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">
                    {getTypeLabel(type)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrganizations.map((org) => (
              <Card
                key={org.id}
                className="hover:shadow-md transition-shadow relative"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {org.profileImage ? (
                      <img
                        src={org.profileImage}
                        alt={org.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {org.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`${getTypeColor(
                          org.organizationType
                        )} border-0`}
                      >
                        {getTypeLabel(org.organizationType)}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ouvrir le menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleSettingsClick(org.publicId)}
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Paramètres
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {(org.bio && org.bio.length > 160
                      ? org.bio.slice(0, 157) + "…"
                      : org.bio) || "Aucune description"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {org.memberCount} membre{org.memberCount > 1 ? "s" : ""}
                    </span>
                    <span className="text-muted-foreground">
                      {org.eventCount || 0} événement
                      {(org.eventCount || 0) > 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm
                  ? "Aucune organisation trouvée"
                  : "Aucune organisation"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par créer votre première organisation"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => router.push("/dashboard/organizations/new")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une organisation
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
