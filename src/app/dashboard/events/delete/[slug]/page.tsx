"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteEventModal from "@/components/dashboard/events/delete/delete-event-banner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, BuildingIcon } from "lucide-react";

interface Event {
  id: number;
  publicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  organization: {
    id: number;
    name: string;
  };
}

export default function DeleteEventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${params.slug}`);
        const data = await response.json();

        if (response.ok) {
          setEvent(data.event);
        } else {
          toast.error(data.error || "Événement non trouvé");
          router.push("/dashboard/events");
        }
      } catch (error) {
        toast.error("Erreur lors du chargement de l'événement");
        router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchEvent();
    }
  }, [params.slug, router]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
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
              <BreadcrumbItem>
                <BreadcrumbPage>Événement non trouvé</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p>Événement non trouvé</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-lg border-destructive/20">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">
            Supprimer l'événement
          </CardTitle>
          <CardDescription>
            Vous êtes sur le point de supprimer définitivement cet événement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {event.description}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  Du {formatDate(event.startDate)} au{" "}
                  {formatDate(event.endDate)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                <span>{event.organization.name}</span>
              </div>
            </div>

            <div className="pt-2">
              <Badge variant="secondary" className="text-xs">
                ID: {event.publicId}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <DeleteEventModal
              eventSlug={params.slug as string}
              eventTitle={event.title}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
