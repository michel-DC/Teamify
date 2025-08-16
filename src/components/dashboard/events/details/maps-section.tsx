"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Import dynamique de la carte pour éviter les erreurs SSR
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Chargement de la carte...</div>
    </div>
  ),
});

interface Event {
  id: number;
  publicId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location: string;
  locationCoords?: { lat: number; lon: number; displayName?: string } | null;
  capacity: number;
  status: "A_VENIR" | "EN_COURS" | "TERMINE" | "ANNULE";
  category: string;
  imageUrl?: string;
}

interface MapsSectionProps {
  className?: string;
}

/**
 * Section de carte interactive affichant les événements géolocalisés
 * avec filtres par statut et popups d'informations
 */
export default function MapsSection({ className }: MapsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "A_VENIR" | "EN_COURS" | "TERMINE"
  >("all");
  const { activeOrganization } = useActiveOrganization();
  const router = useRouter();

  /**
   * Récupération des événements depuis l'API avec leurs coordonnées GPS
   */
  useEffect(() => {
    const fetchEvents = async () => {
      if (!activeOrganization) return;

      try {
        const response = await fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        );
        const data = await response.json();

        // Filtrer les événements qui ont des coordonnées GPS
        const eventsWithCoords = data.events.filter(
          (event: Event) =>
            event.locationCoords &&
            typeof event.locationCoords.lat === "number" &&
            typeof event.locationCoords.lon === "number"
        );

        setEvents(eventsWithCoords);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeOrganization]);

  /**
   * Filtrage des événements selon le statut sélectionné
   */
  const filteredEvents = events.filter((event) => {
    if (selectedStatus === "all") return true;
    return event.status === selectedStatus;
  });

  /**
   * Navigation vers la page de détails d'un événement
   */
  const handleEventDetails = (eventPublicId: string) => {
    router.push(`/dashboard/events/details/${eventPublicId}`);
  };

  /**
   * Formatage de la date pour l'affichage
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Obtention de la couleur du badge selon le statut
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "A_VENIR":
        return "bg-blue-500 hover:bg-blue-600";
      case "EN_COURS":
        return "bg-green-500 hover:bg-green-600";
      case "TERMINE":
        return "bg-gray-500 hover:bg-gray-600";
      case "ANNULE":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  /**
   * Obtention du texte du statut en français
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case "A_VENIR":
        return "À venir";
      case "EN_COURS":
        return "En cours";
      case "TERMINE":
        return "Terminé";
      case "ANNULE":
        return "Annulé";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Carte des événements</CardTitle>
          <CardDescription>
            Visualisez vos événements sur une carte interactive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Carte des événements</CardTitle>
          <CardDescription>
            Visualisez vos événements sur une carte interactive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Aucun événement avec géolocalisation trouvé
              </p>
              <p className="text-sm text-muted-foreground">
                Ajoutez des coordonnées GPS à vos événements pour les voir sur
                la carte
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Carte des événements</CardTitle>
            <CardDescription>
              Visualisez vos événements sur une carte interactive
            </CardDescription>
          </div>

          {/* Filtres par statut */}
          <Tabs
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as any)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="A_VENIR">À venir</TabsTrigger>
              <TabsTrigger value="EN_COURS">En cours</TabsTrigger>
              <TabsTrigger value="TERMINE">Terminés</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Statistiques des événements filtrés */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {filteredEvents.length} événement
              {filteredEvents.length > 1 ? "s" : ""} affiché
              {filteredEvents.length > 1 ? "s" : ""}
            </Badge>
            {selectedStatus !== "all" && (
              <Badge variant="outline">
                Filtré par: {getStatusText(selectedStatus)}
              </Badge>
            )}
          </div>

          {/* Composant de carte */}
          <div className="h-[500px] w-full rounded-lg overflow-hidden border">
            <MapComponent
              events={filteredEvents}
              onEventClick={handleEventDetails}
            />
          </div>

          {/* Légende */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>À venir</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>En cours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Terminé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Annulé</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
