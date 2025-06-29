"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, MapPin, Users, DollarSign, Clock, Tag } from "lucide-react";
import { toast, Toaster } from "sonner";

interface Event {
  id: number;
  publicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
  capacity: number;
  status: string;
  budget: number;
  category: string;
  isPublic: boolean;
  isCancelled: boolean;
  preparationPercentage: number;
  organization: {
    id: number;
    name: string;
  };
}

export default function EventDetailsPage() {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLIE":
        return "bg-green-100 text-green-800";
      case "BROUILLON":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "REUNION":
        return "Réunion";
      case "CONFERENCE":
        return "Conférence";
      case "FORMATION":
        return "Formation";
      case "SOCIAL":
        return "Social";
      case "AUTRE":
        return "Autre";
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <div>Chargement...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!event) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Événement non trouvé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  L'événement demandé n'existe pas ou vous n'avez pas les droits
                  pour le voir.
                </p>
                <Button onClick={() => router.push("/dashboard/events")}>
                  Retour aux événements
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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
                <BreadcrumbItem>
                  <BreadcrumbPage>{event.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Toaster position="top-center" richColors />

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground mt-2">
                Organisation: {event.organization.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/events/edit/${event.publicId}`)
                }
              >
                Modifier
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/events/todo/${event.publicId}`)
                }
              >
                Préparation
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {event.imageUrl && (
                <Card>
                  <CardContent className="p-0">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {event.description || "Aucune description disponible"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    {event.isCancelled && (
                      <Badge variant="destructive">Annulé</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">
                      {getCategoryLabel(event.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <div className="text-sm">
                      <div>Début: {formatDate(event.startDate)}</div>
                      <div>Fin: {formatDate(event.endDate)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      Capacité: {event.capacity} personnes
                    </span>
                  </div>

                  {event.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Budget: {event.budget}€</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Préparation: {event.preparationPercentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push(`/dashboard/events/edit/${event.publicId}`)
                    }
                  >
                    Modifier l'événement
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      router.push(`/dashboard/events/todo/${event.publicId}`)
                    }
                  >
                    Gérer la préparation
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() =>
                      router.push(`/dashboard/events/delete/${event.publicId}`)
                    }
                  >
                    Supprimer l'événement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
