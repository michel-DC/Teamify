"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { AlertTriangle } from "lucide-react";

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
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/dashboard/events/${params.slug}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Événement supprimé avec succès !");
        router.push("/dashboard/events");
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  <BreadcrumbPage>Supprimer l'événement</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Toaster position="top-center" richColors />

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Supprimer l'événement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive font-medium mb-2">
                  ⚠️ Cette action est irréversible
                </p>
                <p className="text-sm text-muted-foreground">
                  Une fois supprimé, cet événement et toutes ses données
                  associées (préparations, invitations, etc.) seront
                  définitivement perdues.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Détails de l'événement à supprimer :
                </h3>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="font-medium">Titre :</span> {event.title}
                  </div>
                  <div>
                    <span className="font-medium">Organisation :</span>{" "}
                    {event.organization.name}
                  </div>
                  <div>
                    <span className="font-medium">Lieu :</span> {event.location}
                  </div>
                  <div>
                    <span className="font-medium">Date de début :</span>{" "}
                    {formatDate(event.startDate)}
                  </div>
                  <div>
                    <span className="font-medium">Date de fin :</span>{" "}
                    {formatDate(event.endDate)}
                  </div>
                  {event.description && (
                    <div>
                      <span className="font-medium">Description :</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/dashboard/events/details/${event.publicId}`)
                  }
                  disabled={isDeleting}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? "Suppression en cours..."
                    : "Confirmer la suppression"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
