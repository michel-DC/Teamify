"use client";

import { MainDashboardStats } from "@/components/dashboard/main-dashboard-stats";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpcomingEventsWidget } from "@/components/dashboard/upcoming-events-widget";
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics";
import { EventCategoriesChart } from "@/components/dashboard/event-categories-chart";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { TeamOverview } from "@/components/dashboard/team-overview";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";

export default function Page() {
  const { activeOrganization } = useActiveOrganization();

  return (
    <div className="flex flex-1 flex-col gap-6 px-6">
      <header className="flex h-16 shrink-0 items-center gap-2 w-full">
        <div className="flex items-center gap-2 px-0">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Tableau de bord
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* En-tête du dashboard */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          {activeOrganization ? (
            <>
              Bienvenue dans votre espace de gestion pour{" "}
              <span className="font-bold text-[#7C3AED]">
                {activeOrganization.name}
              </span>
            </>
          ) : (
            "Sélectionnez une organisation pour commencer"
          )}
        </p>
      </div>

      {/* Alerte si aucune organisation active */}
      {!activeOrganization && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Veuillez sélectionner une organisation active pour voir les données
            du dashboard.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques principales */}
      <MainDashboardStats />

      {/* Actions rapides */}
      <QuickActions />

      {/* Métriques de performance */}
      <PerformanceMetrics />

      {/* Section avec graphique et événements à venir */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Graphique et événements à venir
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <EventCategoriesChart />
        <UpcomingEventsWidget />
      </div>

      {/* Section avec équipe et notifications */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Équipe et notifications
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <TeamOverview />
        <NotificationCenter />
      </div>

      {/* Activités récentes */}
      <RecentActivities />
    </div>
  );
}
