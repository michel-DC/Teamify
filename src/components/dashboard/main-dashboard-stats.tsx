"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  TrendingUp,
  Target,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Euro,
  BarChart3,
} from "lucide-react";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalInvitations: number;
  acceptedInvitations: number;
  pendingInvitations: number;
  totalBudget: number;
  averageBudget: number;
  mostActiveMonth: string;
  topLocation: string;
}

export function MainDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalInvitations: 0,
    acceptedInvitations: 0,
    pendingInvitations: 0,
    totalBudget: 0,
    averageBudget: 0,
    mostActiveMonth: "",
    topLocation: "",
  });
  const [loading, setLoading] = useState(true);
  const { activeOrganization } = useActiveOrganization();

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeOrganization) return;

      try {
        // Récupération des événements
        const eventsResponse = await fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        );
        const eventsData = await eventsResponse.json();

        // Récupération des invitations via l'API dédiée
        const invitationsResponse = await fetch("/api/dashboard/invitations");
        const invitationsData = await invitationsResponse.json();

        if (eventsData.events) {
          const events = eventsData.events;
          const now = new Date();

          // Calcul des statistiques d'événements
          const upcomingEvents = events.filter(
            (event: any) => new Date(event.startDate) > now
          ).length;

          const completedEvents = events.filter(
            (event: any) => new Date(event.endDate) < now
          ).length;

          const totalBudget = events.reduce(
            (sum: number, event: any) => sum + (event.budget || 0),
            0
          );

          const averageBudget =
            events.length > 0 ? totalBudget / events.length : 0;

          // Calcul du mois le plus actif
          const monthCounts: { [key: string]: number } = {};
          events.forEach((event: any) => {
            const month = new Date(event.startDate).toLocaleDateString(
              "fr-FR",
              { month: "long" }
            );
            monthCounts[month] = (monthCounts[month] || 0) + 1;
          });

          const mostActiveMonth =
            Object.entries(monthCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
            "";

          // Calcul de la localisation la plus utilisée
          const locationCounts: { [key: string]: number } = {};
          events.forEach((event: any) => {
            const location = event.location.split(",")[0].trim();
            locationCounts[location] = (locationCounts[location] || 0) + 1;
          });

          const topLocation =
            Object.entries(locationCounts).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "";

          // Calcul des statistiques d'invitations basées sur les vraies données
          const invitations = invitationsData.invitations || [];
          const totalInvitations = invitations.length;

          // Filtrer les invitations par statut
          const acceptedInvitations = invitations.filter(
            (invitation: any) => invitation.status === "ACCEPTED"
          ).length;

          const pendingInvitations = invitations.filter(
            (invitation: any) => invitation.status === "PENDING"
          ).length;

          setStats({
            totalEvents: events.length,
            upcomingEvents,
            completedEvents,
            totalInvitations,
            acceptedInvitations,
            pendingInvitations,
            totalBudget,
            averageBudget,
            mostActiveMonth,
            topLocation,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeOrganization]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Événements totaux
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">
            Tous les événements créés
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">À venir</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          <p className="text-xs text-muted-foreground">Événements programmés</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedEvents}</div>
          <p className="text-xs text-muted-foreground">Événements passés</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget total</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalBudget.toLocaleString()}€
          </div>
          <p className="text-xs text-muted-foreground">Budget alloué</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invitations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInvitations}</div>
          <p className="text-xs text-muted-foreground">Total des invitations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.acceptedInvitations}</div>
          <p className="text-xs text-muted-foreground">
            Invitations confirmées
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingInvitations}</div>
          <p className="text-xs text-muted-foreground">
            Invitations en attente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget moyen</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.averageBudget).toLocaleString()}€
          </div>
          <p className="text-xs text-muted-foreground">Par événement</p>
        </CardContent>
      </Card>
    </div>
  );
}
