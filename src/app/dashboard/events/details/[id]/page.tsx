"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PreparationBanner from "@/components/dashboard/events/todo/PreparationBanner";

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

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${params.id}`);
        if (!response.ok) {
          throw new Error("Événement non trouvé");
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEventDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ml-[260px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 ml-[260px]">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 ml-[260px]">
        <p>Événement non trouvé</p>
        <Button onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {event.imageUrl && (
            <div className="md:w-1/2 w-full flex justify-center mt-12">
              <Image
                src={event.imageUrl}
                alt={event.title}
                width={500}
                height={300}
                className="w-full max-w-md h-auto rounded-2xl object-cover"
              />
            </div>
          )}
          <div className="flex-1 flex flex-col gap-4 md:pt-6">
            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="font-semibold">Catégorie :</span>
                <Badge variant="outline">{event.category}</Badge>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Statut :</span>
                <Badge variant="outline">{event.status}</Badge>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Lieu :</span>
                <span>{event.location}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Capacité :</span>
                <span>{event.capacity} personnes</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Budget :</span>
                <span>{event.budget ? `${event.budget}€` : "Non défini"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Date de début :</span>
                <span>
                  {event.startDate
                    ? new Date(event.startDate).toLocaleDateString()
                    : "Non définie"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Date de fin :</span>
                <span>
                  {event.endDate
                    ? new Date(event.endDate).toLocaleDateString()
                    : "Non définie"}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-semibold">État :</span>
                <div
                  className={`size-2 rounded-full ${
                    !event.isCancelled ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span
                  className={
                    !event.isCancelled ? "text-green-600" : "text-red-600"
                  }
                >
                  {!event.isCancelled ? "Actif" : "Annulé"}
                </span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button className="bg-green-700 hover:bg-green-800 text-white">
                Modifier l'évènement
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Supprimer l'évènement
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 items-center justify-center">
          <h3 className="font-semibold mb-2">Description :</h3>
          <p className="text-muted-foreground">
            {event.description || "Aucune description disponible"}
          </p>
        </div>
        <div className="px-12">
          <PreparationBanner percentage={event.preparationPercentage ?? 0} />
        </div>
      </div>
    </div>
  );
}
