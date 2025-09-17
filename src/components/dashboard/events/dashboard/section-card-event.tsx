"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Calendar, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateToFrench } from "@/lib/utils";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

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

const CardSkeleton = () => (
  <Card className="border-2 shadow-lg bg-muted/60 animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-6 w-36 rounded bg-primary/30" />
      <Skeleton className="h-6 w-6 rounded-full bg-primary/30" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-24 mb-4 rounded bg-primary/20" />
      <Skeleton className="h-4 w-32 rounded bg-primary/20" />
    </CardContent>
  </Card>
);

export function SectionCards() {
  const [loading, setLoading] = React.useState(true);
  const [totalBudget, setTotalBudget] = React.useState<number | null>(null);
  const [eventCount, setEventCount] = React.useState<number | null>(null);
  const [mostCreatedCategory, setMostCreatedCategory] = React.useState<
    string | null
  >(null);
  const [lastEventDate, setLastEventDate] = React.useState<string | null>(null);
  const [publicEventCount, setPublicEventCount] = React.useState<number | null>(
    null
  );
  const [cancelledEventCount, setCancelledEventCount] = React.useState<
    number | null
  >(null);
  const [finishEventCount, setFinishEventCount] = React.useState<number | null>(
    null
  );
  const [mostPresentCity, setMostPresentCity] = React.useState<string | null>(
    null
  );
  const { activeOrganization } = useActiveOrganization();

  React.useEffect(() => {
    const fetchEventsData = async () => {
      if (!activeOrganization) return;

      try {
        const response = await fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        );
        const data = await response.json();

        if (data.events) {
          const calculatedTotalBudget = data.events.reduce(
            (sum: number, event: { budget: number | null }) => {
              return sum + (event.budget || 0);
            },
            0
          );
          setTotalBudget(calculatedTotalBudget);

          setEventCount(data.events.length);

          const categoryCounts: { [key: string]: number } = {};
          data.events.forEach((event: { category: string }) => {
            categoryCounts[event.category] =
              (categoryCounts[event.category] || 0) + 1;
          });

          let maxCount = 0;
          let mostFrequentCategory: string | null = null;
          for (const category in categoryCounts) {
            if (categoryCounts[category] > maxCount) {
              maxCount = categoryCounts[category];
              mostFrequentCategory = category;
            }
          }
          setMostCreatedCategory(mostFrequentCategory);

          const cityCounts: { [key: string]: number } = {};
          data.events.forEach((event: { location: string }) => {
            const cityName = extractCityName(event.location);
            cityCounts[cityName] = (cityCounts[cityName] || 0) + 1;
          });

          let maxCityCount = 0;
          let mostFrequentCity: string | null = null;
          for (const city in cityCounts) {
            if (cityCounts[city] > maxCityCount) {
              maxCityCount = cityCounts[city];
              mostFrequentCity = city;
            }
          }
          setMostPresentCity(mostFrequentCity);

          if (data.events.length > 0) {
            const sortedEvents = [...data.events].sort(
              (a: { createdAt: string }, b: { createdAt: string }) => {
                return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                );
              }
            );
            const lastEvent = sortedEvents[0];
            setLastEventDate(formatDateToFrench(lastEvent.createdAt));
          }

          const publicEventCount = data.events.filter(
            (event: { isPublic: boolean }) => event.isPublic === true
          ).length;
          setPublicEventCount(publicEventCount);

          const finishEventCount = data.events.filter(
            (event: { status: string }) => event.status === "TERMINE"
          ).length;
          setFinishEventCount(finishEventCount);

          const cancelledEventCount = data.events.filter(
            (event: { isCancelled: boolean }) => event.isCancelled === true
          ).length;
          setCancelledEventCount(cancelledEventCount);
        }
      } catch (error) {
        console.error("Error fetching events data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsData();
  }, [activeOrganization]);

  // Affichage des skeletons pendant le chargement
  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6 mb-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre d&apos;événements
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCount ?? "—"}</div>
            <p className="text-xs text-muted-foreground">
              Total des événements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBudget !== null ? `${totalBudget.toFixed(2)} €` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Budget cumulé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Catégorie la plus populaire
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostCreatedCategory ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground">La plus utilisée</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ville la plus populaire
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostPresentCity ?? "—"}</div>
            <p className="text-xs text-muted-foreground">
              Où se déroulent le plus d&apos;événements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernier événement
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastEventDate ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Date de création</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Événements publics
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicEventCount ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Visibles par tous</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Événements terminés
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishEventCount ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Statut terminé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Événements annulés
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cancelledEventCount ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground">Total annulés</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
