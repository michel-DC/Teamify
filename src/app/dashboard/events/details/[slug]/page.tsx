"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AutoSignedImage } from "@/components/ui/auto-signed-image";
import PreparationBanner from "@/components/dashboard/events/todo/preparation-banner";
// import { StatCardDetails } from "@/components/dashboard/events/details/stat-card-details";
import InvitationTable from "@/components/dashboard/events/details/invitation-table";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  MapPin,
  Calendar,
  Tag,
  Users,
  Eye,
  Slash,
  CalendarPlus,
} from "lucide-react";
import { formatEventStatus, formatDateToFrench } from "@/lib/utils";
import { useOrganizationPermissions } from "@/hooks/useOrganization";
import { addEventToGoogleCalendar } from "@/lib/google-calendar-utils";

/**
 * Extrait le nom de la ville depuis une adresse complète
 */
const extractCityName = (address: string): string => {
  if (!address) return "Non défini";

  // Divise l'adresse par les virgules
  const parts = address.split(",").map((part) => part.trim());

  // Cherche la ville (généralement après le code postal ou dans les premières parties)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Ignore les codes postaux (5 chiffres en France)
    if (/^\d{5}$/.test(part)) continue;
    // Ignore les parties qui ressemblent à des codes ou des numéros
    if (/^\d+$/.test(part)) continue;
    // Retourne la première partie qui ressemble à une ville
    if (
      part.length > 2 &&
      !part.includes("Rue") &&
      !part.includes("Avenue") &&
      !part.includes("Boulevard")
    ) {
      return part;
    }
  }

  // Si aucune ville n'est trouvée, retourne la première partie non vide
  const firstValidPart = parts.find((part) => part.length > 2);
  return firstValidPart || "Ville inconnue";
};

type EventDetails = {
  id: number;
  title: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  capacity: number;
  status: string;
  category: string;
  budget: number | null;
  isCancelled: boolean;
  imageUrl: string | null;
  preparationPercentage?: number;
  eventCode: string;
  slug?: string;
  orgId: number;
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canModifyEvent, canDeleteEvent, fetchUserRole } =
    useOrganizationPermissions();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${params.slug}`);
        if (!response.ok) {
          throw new Error("Événement non trouvé");
        }
        const data = await response.json();
        setEvent(data.event);

        // Récupérer le rôle de l'utilisateur dans l'organisation
        if (data.event?.organization?.publicId) {
          await fetchUserRole(data.event.organization.publicId);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchEventDetails();
    }
  }, [params.slug, fetchUserRole]);

  const formatDate = (d?: Date | string | null) => {
    return formatDateToFrench(d);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">Événement non trouvé</p>
        <Button onClick={() => router.back()}>Retour</Button>
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/events">
                  Événements
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>Détails de l&apos;événement</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{event.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-6 p-6 lg:p-8 max-w-8xl mx-auto w-full px-12 lg:px-24">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {event.imageUrl && (
                <div className="md:w-1/2 w-full flex justify-center">
                  <AutoSignedImage
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full max-w-2xl h-auto rounded-2xl object-cover"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col gap-4 items-center justify-center">
                <h1 className="text-4xl font-bold text-center">
                  {event.title}
                </h1>
                <div className="flex gap-4 flex-wrap justify-center">
                  {canModifyEvent && (
                    <Button
                      className="bg-[#7C3AED] hover:bg-[#c1a3f4] text-white"
                      onClick={() =>
                        router.push(`/dashboard/events/edit/${params.slug}`)
                      }
                    >
                      Modifier l&apos;événement
                    </Button>
                  )}
                  {canDeleteEvent && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        router.push(`/dashboard/events/delete/${params.slug}`)
                      }
                    >
                      Supprimer l&apos;événement
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="bg-background text-foreground hover:bg-background/90 border border-border"
                    onClick={() =>
                      addEventToGoogleCalendar({
                        title: event.title,
                        description: event.description,
                        location: event.location,
                        startDate: event.startDate,
                        endDate: event.endDate,
                      })
                    }
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Ajouter à Google Agenda
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {event.budget !== null
                      ? `${event.budget.toFixed(2)} €`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Budget de l&apos;événement
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Catégorie
                  </CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {event.category || "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Type d&apos;événement
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Statut</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatEventStatus(event.status) || "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">État actuel</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Capacité
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {event.capacity ?? "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nombre prévisionnel de participants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lieu</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {extractCityName(event.location)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ville / adresse
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dates</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{`${formatDate(
                    event.startDate
                  )} → ${formatDate(event.endDate)}`}</div>
                  <p className="text-xs text-muted-foreground">Début → Fin</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Visibilité
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {event.status !== "ANNULE" ? "Publique" : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selon configuration
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Annulation
                  </CardTitle>
                  <Slash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {event.isCancelled ? "Annulé" : "Actif"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    État d&apos;annulation
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <PreparationBanner
                percentage={event.preparationPercentage ?? 0}
                eventCode={event.eventCode}
              />
            </div>
            <div>
              <InvitationTable
                eventId={event.id}
                eventSlug={params.slug as string}
                eventName={event.title}
                eventDate={
                  event.startDate ? formatDate(event.startDate) : undefined
                }
                eventLocation={event.location}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
