"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PreparationBanner from "@/components/dashboard/events/todo/PreparationBanner";
import { StatCardDetails } from "@/components/dashboard/events/details/stat-card-details";
import InvitationTable from "@/components/dashboard/events/details/invitation-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
  slug?: string;
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
        const response = await fetch(`/api/dashboard/events/${params.slug}`);
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

    if (params.slug) {
      fetchEventDetails();
    }
  }, [params.slug]);

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
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {event.imageUrl && (
              <div className="md:w-1/2 w-full flex justify-center">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={500}
                  height={300}
                  className="w-full max-w-md h-auto rounded-2xl object-cover"
                />
              </div>
            )}
            <div className="flex-1 flex flex-col gap-4 items-center justify-center">
              <h1 className="text-4xl font-bold text-center">{event.title}</h1>
              <div className="flex gap-4">
                <Button
                  className="bg-green-700 hover:bg-green-800 text-white"
                  onClick={() =>
                    router.push(`/dashboard/events/edit/${params.slug}`)
                  }
                >
                  Modifier l'évènement
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    router.push(`/dashboard/events/delete/${params.slug}`)
                  }
                >
                  Supprimer l'évènement
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <StatCardDetails event={event} />
          </div>
          <div>
            <PreparationBanner
              percentage={event.preparationPercentage ?? 0}
              eventId={event.id}
            />
          </div>
          <div>
            <InvitationTable eventId={event.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
