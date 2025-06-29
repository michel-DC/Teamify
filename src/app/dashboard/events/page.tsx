"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast, Toaster } from "sonner";
import { Calendar, MapPin, Users, Plus, Eye, Edit, Trash2 } from "lucide-react";

interface Event {
  id: string;
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

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/dashboard/events/data");
        const data = await response.json();

        if (response.ok) {
          setEvents(data.events || []);
        } else {
          toast.error(data.error || "Erreur lors du chargement des événements");
        }
      } catch (error) {
        toast.error("Erreur réseau");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Tableau de bord
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Événements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-4 p-4 pt-0 max-w-7xl mx-auto w-full">
          <Toaster position="top-center" richColors />

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Mes événements</h1>
              <p className="text-muted-foreground mt-2">
                Gérez tous vos événements en un seul endroit
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard/events/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun événement</h3>
                <p className="text-muted-foreground mb-6">
                  Vous n'avez pas encore créé d'événement. Commencez par créer
                  votre premier événement.
                </p>
                <Button onClick={() => router.push("/dashboard/events/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer mon premier événement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card
                  key={event.publicId}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {event.imageUrl && (
                    <div className="aspect-video relative">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {event.isCancelled && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive">Annulé</Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {event.title}
                      </CardTitle>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.organization.name}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.capacity} personnes</span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getCategoryLabel(event.category)}</span>
                      <span>Préparation: {event.preparationPercentage}%</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          router.push(
                            `/dashboard/events/details/${event.publicId}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          router.push(
                            `/dashboard/events/edit/${event.publicId}`
                          )
                        }
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/events/delete/${event.publicId}`
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
