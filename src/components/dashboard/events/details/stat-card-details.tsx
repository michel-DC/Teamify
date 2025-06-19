"use client";

import * as React from "react";
import { IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
};

export function StatCardDetails({ event }: { event: EventDetails }) {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-center text-foreground mb-4">
        <h1 className="text-3xl font-semibold">Détails de l'évènement</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Catégorie</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {event.category}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Catégorie
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Type d'évènement <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Catégorie de l'évènement
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Statut</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {event.status}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Statut
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              État de l'évènement <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Statut actuel de l'évènement
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>État</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {!event.isCancelled ? "Actif" : "Annulé"}
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className={
                  !event.isCancelled ? "text-green-600" : "text-red-600"
                }
              >
                <IconTrendingUp />
                {!event.isCancelled ? "Actif" : "Annulé"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              État de l'évènement <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Indique si l'évènement est actif ou annulé
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Période de l'évènement</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {event.startDate
                ? `${new Date(event.startDate).toLocaleDateString()} - ${
                    event.endDate
                      ? new Date(event.endDate).toLocaleDateString()
                      : "Non définie"
                  }`
                : "Non définie"}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Période
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Période <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Période complète de l'évènement
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Budget</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {event.budget ? `${event.budget.toFixed(2)} €` : "Non défini"}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Budget
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Budget de l'évènement <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Budget total alloué pour cet évènement
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Capacité</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {event.capacity} personnes
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Capacité
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Capacité maximale <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Nombre maximum de participants pour cet évènement
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {event.description || "Aucune description disponible"}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                Description
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Description de l'évènement <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Description détaillée de l'évènement
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
