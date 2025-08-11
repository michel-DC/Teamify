"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Calendar, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCards() {
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

  React.useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const response = await fetch("/api/dashboard/events/data");
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
            cityCounts[event.location] = (cityCounts[event.location] || 0) + 1;
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
            setLastEventDate(
              new Date(lastEvent.createdAt).toLocaleDateString()
            );
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
      }
    };

    fetchEventsData();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre d&apos;évènements
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCount ?? "—"}</div>
            <p className="text-xs text-muted-foreground">
              Total des évènements
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
              Où se déroulent le plus d&apos;évènements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernier évènement
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
              Évènements publics
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
              Évènements terminés
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
              Évènements annulés
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
