"use client";

import * as React from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
          // calcul du budget total de tous les évènements confondu
          const calculatedTotalBudget = data.events.reduce(
            (sum: number, event: { budget: number | null }) => {
              return sum + (event.budget || 0);
            },
            0
          );
          setTotalBudget(calculatedTotalBudget);

          // le nombre total d'évènements
          setEventCount(data.events.length);

          // calcul de la catégorie la plus utilisé
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

          // calcul de la ville la plus utilisé
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

          // calcul de la dernière date de création d'une activité
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

          // calcul du nombre d'évènements public
          const publicEventCount = data.events.filter(
            (event: { isPublic: boolean }) => event.isPublic === true
          ).length;
          setPublicEventCount(publicEventCount);

          // calcul du nombre d'évènements terminés
          const finishEventCount = data.events.filter(
            (event: { status: string }) => event.status === "TERMINE"
          ).length;
          setFinishEventCount(finishEventCount);

          // calcul du nombre d'évènements annulé
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
      <div className="flex items-center justify-center text-foreground mb-4">
        <h1 className="text-3xl font-semibold">Vos statistiques</h1>
      </div>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Nombre d&apos;évènements</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {eventCount !== null ? eventCount : "Loading..."}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Loading...
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Vos évènements <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Nombre total d&apos;évènements au nom de cette organisation
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Budget total</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalBudget !== null
                ? `${totalBudget.toFixed(2)} €`
                : "Loading..."}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Loading...
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Aperçu du budget <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Budget total investi pour tous vos événements
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Catégorie la plus populaire</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {mostCreatedCategory !== null
                ? mostCreatedCategory
                : "Loading..."}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Loading...
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              L&apos;utilisation de cette catégorie{" "}
              <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              La catégorie la plus utilisée pour les évènements de cette
              organisation
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Ville la plus populaire</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {mostPresentCity !== null ? mostPresentCity : "Loading..."}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Loading...
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Ville la plus populaire <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              La ville où se déroulent le plus d&apos;évènements de cette
              organisation
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Dernier évènement</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {lastEventDate !== null ? lastEventDate : "Loading..."}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Loading...
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Date de création <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Date de création du dernier évènement
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Nombre d&apos;évènement public</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {publicEventCount !== null ? publicEventCount : "Loading..."}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Loading...
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Évènements publics <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Nombre d&apos;évènements visibles par tous
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Nombre d&apos;événements terminés</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {finishEventCount !== null ? finishEventCount : "Loading..."}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Loading...
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Évènements terminés <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Nombre total d&apos;évènements terminés
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Nombre d&apos;évènements annulé</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {cancelledEventCount !== null
                ? cancelledEventCount
                : "Loading..."}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Loading...
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Évènements annulé <IconTrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Nombre total d&apos;évènements annulés
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
