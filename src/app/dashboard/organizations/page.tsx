"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Users, Calendar, TrendingUp } from "lucide-react";
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
import { toast, Toaster } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";

interface OrganizationStats {
  totalOrganizations: number;
  totalMembers: number;
  totalEvents: number;
  averageEventsPerOrg: number;
}

export default function OrganizationsDashboardPage() {
  const router = useRouter();
  const { organizations, events, loading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<OrganizationStats>({
    totalOrganizations: 0,
    totalMembers: 0,
    totalEvents: 0,
    averageEventsPerOrg: 0,
  });

  useEffect(() => {
    if (organizations.length > 0) {
      const totalMembers = organizations.reduce(
        (sum, org) => sum + org.memberCount,
        0
      );
      const totalEvents = events.length || 0;

      setStats({
        totalOrganizations: organizations.length,
        totalMembers,
        totalEvents,
        averageEventsPerOrg:
          organizations.length > 0
            ? Math.round((totalEvents / organizations.length) * 10) / 10
            : 0,
      });
    }
  }, [organizations]);

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
        return "bg-blue-100 text-blue-800";
      case "PME":
        return "bg-yellow-100 text-yellow-800";
      case "ENTREPRISE":
        return "bg-green-100 text-green-800";
      case "STARTUP":
        return "bg-purple-100 text-purple-800";
      case "AUTO_ENTREPRENEUR":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Chargement des organisations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Tableau de bord
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Organisations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Toaster position="top-center" richColors />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organisations</h1>
            <p className="text-muted-foreground">
              Gérez vos organisations et leurs événements
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/organizations/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle organisation
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Organisations
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalOrganizations}
              </div>
              <p className="text-xs text-muted-foreground">
                Organisations créées
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
              <p className="text-xs text-muted-foreground">Total des membres</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Événements organisés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageEventsPerOrg}
              </div>
              <p className="text-xs text-muted-foreground">
                Événements par org.
              </p>
            </CardContent>
          </Card>
        </div>

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
          {filteredOrganizations.length > 0 ? (
            filteredOrganizations.map((org) => (
              <Card
                key={org.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/organizations/${org.id}`)
                }
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
                          (org as any).organizationType
                        )} border-0`}
                      >
                        {getTypeLabel((org as any).organizationType)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {org.bio || "Aucune description"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {org.memberCount} membre{org.memberCount > 1 ? "s" : ""}
                    </span>
                    <span className="text-muted-foreground">
                      {events.length || 0} événement
                      {(events.length || 0) > 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
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
    </div>
  );
}
