"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, Users, Sparkles } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location: string;
  imageUrl?: string;
  capacity: number;
  status: string;
  category: string;
  organization: {
    name: string;
  };
}

interface PlaceholderEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  location: string;
  capacity: number;
  status: string;
  isPlaceholder: true;
}

export default function EventsSlider() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const placeholderEvents: PlaceholderEvent[] = [
    {
      id: "placeholder-1",
      title: "Réunion d'équipe",
      description: "Exemple d'événement de réunion",
      startDate: new Date(Date.now() + 86400000).toISOString(),
      location: "Salle de conférence",
      capacity: 15,
      status: "PUBLIE",
      isPlaceholder: true,
    },
    {
      id: "placeholder-2",
      title: "Formation développement",
      description: "Session de formation technique",
      startDate: new Date(Date.now() + 172800000).toISOString(),
      location: "Centre de formation",
      capacity: 25,
      status: "BROUILLON",
      isPlaceholder: true,
    },
    {
      id: "placeholder-3",
      title: "Conférence annuelle",
      description: "Événement majeur de l'organisation",
      startDate: new Date(Date.now() + 259200000).toISOString(),
      location: "Auditorium principal",
      capacity: 100,
      status: "PUBLIE",
      isPlaceholder: true,
    },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/dashboard/events/data");
        const data = await response.json();
        if (data.events) {
          setEvents(data.events.slice(-6));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des événements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLIE":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "BROUILLON":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "TERMINE":
        return "bg-muted text-muted-foreground";
      case "ANNULE":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getDisplayEvents = () => {
    if (events.length < 2) {
      const combinedEvents = [
        ...events,
        ...placeholderEvents.slice(0, 5 - events.length),
      ];
      return [...combinedEvents, ...combinedEvents, ...combinedEvents];
    }
    return [...events, ...events, ...events];
  };

  const displayEvents = getDisplayEvents();

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-muted-foreground">
          Événements récents
        </h3>
        <div className="overflow-hidden">
          <div className="flex gap-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="flex-none w-72">
                <CardContent className="p-3">
                  <div className="h-20 bg-muted rounded mb-3"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-2 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Événements récents</CardTitle>
          <CardDescription>
            Liste des 6 derniers événements créés par votre organisation
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="">
        <div className="space-y-3">
          <div className="overflow-hidden relative">
            <div
              className="flex gap-3 animate-slide"
              style={{
                width: `${displayEvents.length * 300}px`,
              }}
            >
              {displayEvents.map((event, index) => {
                const isPlaceholder = "isPlaceholder" in event;
                return (
                  <Card
                    key={`${event.id}-${index}`}
                    className={cn(
                      "flex-none w-72 transition-shadow",
                      isPlaceholder
                        ? "bg-muted/30 border-dashed border-muted-foreground/30 hover:shadow-sm"
                        : "hover:shadow-md"
                    )}
                  >
                    <CardContent className="p-0">
                      <div
                        className={cn(
                          "relative h-20 rounded-t-lg",
                          isPlaceholder ? "bg-muted/50" : "bg-muted/20"
                        )}
                      >
                        {!isPlaceholder && event.imageUrl ? (
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            width={288}
                            height={80}
                            className="w-full h-full object-cover rounded-t-lg"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {isPlaceholder ? (
                              <Sparkles className="h-6 w-6 text-muted-foreground/50" />
                            ) : (
                              <Calendar className="h-6 w-6 text-muted-foreground/50" />
                            )}
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-xs font-medium",
                              getStatusColor(event.status),
                              isPlaceholder && "opacity-70"
                            )}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 space-y-2">
                        <div>
                          <h4
                            className={cn(
                              "font-medium text-sm line-clamp-1",
                              isPlaceholder
                                ? "text-muted-foreground/80"
                                : "text-foreground"
                            )}
                          >
                            {event.title}
                          </h4>
                          <p
                            className={cn(
                              "text-xs line-clamp-1",
                              isPlaceholder
                                ? "text-muted-foreground/60"
                                : "text-muted-foreground"
                            )}
                          >
                            {event.description || "Aucune description"}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "space-y-1 text-xs",
                            isPlaceholder
                              ? "text-muted-foreground/60"
                              : "text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">
                              {event.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            <span>{event.capacity} max</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <style jsx>{`
            @keyframes slide {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-${(displayEvents.length / 3) * 300}px);
              }
            }

            .animate-slide {
              animation: slide ${displayEvents.length * 2}s linear infinite;
            }

            .animate-slide:hover {
              animation-play-state: paused;
            }
          `}</style>
        </div>
      </CardContent>
    </Card>
  );
}
