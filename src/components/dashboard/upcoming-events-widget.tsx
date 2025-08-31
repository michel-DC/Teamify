"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useEffect, useState } from "react";
import { formatDateToFrench } from "@/lib/utils";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  status: string;
  eventCode: string;
  imageUrl?: string;
}

export function UpcomingEventsWidget() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeOrganization } = useActiveOrganization();

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!activeOrganization) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.events && Array.isArray(data.events)) {
          const now = new Date();

          const upcomingEvents = data.events
            .filter((event: any) => {
              // Vérification que startDate existe et est valide
              if (!event.startDate) return false;
              const eventDate = new Date(event.startDate);
              return !isNaN(eventDate.getTime()) && eventDate > now;
            })
            .sort((a: any, b: any) => {
              const dateA = new Date(a.startDate);
              const dateB = new Date(b.startDate);
              return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 5);

          setEvents(upcomingEvents);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des événements à venir:",
          error
        );
        setError("Erreur lors du chargement des événements");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [activeOrganization]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLIE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "BROUILLON":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "ANNULE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PUBLIE":
        return "Publié";
      case "BROUILLON":
        return "Brouillon";
      case "ANNULE":
        return "Annulé";
      default:
        return status;
    }
  };

  const getDaysUntilEvent = (startDate: string) => {
    const now = new Date();
    const eventDate = new Date(startDate);

    if (isNaN(eventDate.getTime())) {
      return "Date invalide";
    }

    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays < 0) return "En retard";
    return `Dans ${diffDays} jours`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Événements à venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Événements à venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-sm mt-2">Veuillez réessayer plus tard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Événements à venir
        </CardTitle>
        <Link href="/dashboard/events">
          <Button variant="ghost" size="sm">
            Voir tout
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun événement à venir</p>
            <p className="text-sm">
              Créez votre premier événement pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium truncate">
                      {event.title}
                    </h4>
                    <Badge className={getStatusColor(event.status)}>
                      {getStatusText(event.status)}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateToFrench(event.startDate)}</span>
                      <span className="text-primary font-medium">
                        ({getDaysUntilEvent(event.startDate)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Capacité: {event.capacity} personnes</span>
                    </div>
                  </div>
                </div>

                <Link href={`/dashboard/events/details/${event.eventCode}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
