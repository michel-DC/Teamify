"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast, Toaster } from "sonner";
import { ArrowLeft, TrendingUp } from "lucide-react";
import KanbanBoard from "@/components/dashboard/events/todo/kanban-board";

interface Event {
  id: number;
  publicId: string;
  eventCode: string;
  title: string;
  preparationPercentage: number;
  organization: {
    id: number;
    name: string;
  };
}

export default function EventTodoPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventResponse = await fetch(
          `/api/dashboard/events/${params.slug}`
        );
        const eventData = await eventResponse.json();

        if (eventResponse.ok) {
          setEvent(eventData.event);
        } else {
          toast.error(eventData.error || "Événement non trouvé");
          router.push("/dashboard/events");
          return;
        }
      } catch {
        toast.error("Erreur lors du chargement des données");
        router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchEvent();
    }
  }, [params.slug, router]);

  const handleKanbanChange = () => {
    // Rafraîchir les données de l'événement après modification
    if (params.slug) {
      fetch(`/api/dashboard/events/${params.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.event) {
            setEvent(data.event);
          }
        })
        .catch(console.error);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Événement non trouvé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                L&apos;événement demandé n&apos;existe pas ou vous n&apos;avez
                pas les droits pour le voir.
              </p>
              <Button onClick={() => router.push("/dashboard/events")}>
                Retour aux événements
              </Button>
            </CardContent>
          </Card>
        </div>
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href={`/dashboard/events/details/${event.eventCode}`}
                >
                  Détails de l'événement
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Préparation Kanban</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        {/* En-tête de la page */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Préparation Kanban
            </h1>
            <p className="text-muted-foreground mt-2">{event.title}</p>
            <p className="text-sm text-muted-foreground">
              Code événement:{" "}
              <span className="font-mono font-bold">{event.eventCode}</span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/events/details/${event.eventCode}`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux détails
          </Button>
        </div>

        {/* Carte de progression globale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progression globale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progression actuelle</span>
                <span className="font-bold">
                  {event.preparationPercentage}%
                </span>
              </div>
              <Progress value={event.preparationPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {event.preparationPercentage === 0
                  ? "Commencez par créer des groupes de tâches"
                  : event.preparationPercentage < 50
                  ? "Bonne progression ! Continuez à organiser vos tâches"
                  : event.preparationPercentage < 100
                  ? "Excellent travail ! Vous êtes presque prêt"
                  : "Parfait ! Toutes les tâches sont terminées"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tableau Kanban */}
        <KanbanBoard
          eventCode={event.eventCode}
          onChange={handleKanbanChange}
        />
      </div>
    </div>
  );
}
