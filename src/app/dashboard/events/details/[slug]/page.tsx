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
                  Évènements
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>Détails de l&apos;évènement</BreadcrumbItem>
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
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
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
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Ajouter à Google Agenda
                  </Button>
                  {canModifyEvent && (
                    <Button
                      className="bg-green-700 hover:bg-green-800 text-white"
                      onClick={() =>
                        router.push(`/dashboard/events/edit/${params.slug}`)
                      }
                    >
                      Modifier l&apos;évènement
                    </Button>
                  )}
                  {canDeleteEvent && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        router.push(`/dashboard/events/delete/${params.slug}`)
                      }
                    >
                      Supprimer l&apos;évènement
                    </Button>
                  )}
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
                    Budget de l&apos;évènement
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
                    Type d&apos;évènement
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
