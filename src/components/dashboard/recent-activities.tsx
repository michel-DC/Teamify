"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useEffect, useState } from "react";
import { formatDateToFrench } from "@/lib/utils";

interface Activity {
  id: string;
  type:
    | "event_created"
    | "event_updated"
    | "invitation_sent"
    | "invitation_accepted"
    | "member_added";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  event?: {
    title: string;
    eventCode: string;
  };
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeOrganization } = useActiveOrganization();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!activeOrganization) return;

      try {
        const response = await fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        );
        const data = await response.json();

        if (data.events) {
          const events = data.events.slice(0, 5);
          const mockActivities: Activity[] = events.map(
            (event: any, index: number) => ({
              id: `activity-${index}`,
              type:
                index % 3 === 0
                  ? "event_created"
                  : index % 3 === 1
                  ? "invitation_sent"
                  : "invitation_accepted",
              title:
                index % 3 === 0
                  ? "Nouvel événement créé"
                  : index % 3 === 1
                  ? "Invitations envoyées"
                  : "Invitation acceptée",
              description:
                index % 3 === 0
                  ? `L'événement "${event.title}" a été créé avec succès`
                  : index % 3 === 1
                  ? `${event.capacity} invitations ont été envoyées pour "${event.title}"`
                  : `Un participant a confirmé sa présence à "${event.title}"`,
              timestamp: new Date(Date.now() - index * 86400000).toISOString(),
              user: {
                name: "Utilisateur Demo",
                email: "demo@example.com",
              },
              event: {
                title: event.title,
                eventCode: event.eventCode,
              },
            })
          );

          // Ajouter quelques activités supplémentaires basées sur les vraies données
          const additionalActivities: Activity[] = [];

          if (events.length > 0) {
            const publishedEvents = events.filter(
              (event: any) => event.status === "PUBLIE"
            ).length;
            const draftEvents = events.filter(
              (event: any) => event.status === "BROUILLON"
            ).length;

            if (publishedEvents > 0) {
              additionalActivities.push({
                id: "activity-published",
                type: "event_updated",
                title: "Événements publiés",
                description: `${publishedEvents} événement${
                  publishedEvents > 1 ? "s" : ""
                } ont été publiés avec succès`,
                timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
                user: {
                  name: "Organisateur",
                  email: "organisateur@example.com",
                },
              });
            }

            if (draftEvents > 0) {
              additionalActivities.push({
                id: "activity-drafts",
                type: "event_created",
                title: "Brouillons en attente",
                description: `${draftEvents} événement${
                  draftEvents > 1 ? "s" : ""
                } en attente de publication`,
                timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
                user: {
                  name: "Organisateur",
                  email: "organisateur@example.com",
                },
              });
            }
          }

          setActivities(
            [...mockActivities, ...additionalActivities].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
          );
        }
      } catch (error) {
        console.error("Erreur lors du chargement des activités:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [activeOrganization]);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "event_created":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "event_updated":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "invitation_sent":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "invitation_accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "member_added":
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "event_created":
        return <Badge variant="default">Créé</Badge>;
      case "event_updated":
        return <Badge variant="secondary">Modifié</Badge>;
      case "invitation_sent":
        return <Badge variant="outline">Invitation</Badge>;
      case "invitation_accepted":
        return <Badge variant="default">Accepté</Badge>;
      case "member_added":
        return <Badge variant="secondary">Membre</Badge>;
      default:
        return <Badge variant="secondary">Autre</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activités récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user?.avatar} />
                <AvatarFallback>
                  {activity.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {getActivityBadge(activity.type)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getActivityIcon(activity.type)}
                  <span>{formatDateToFrench(activity.timestamp)}</span>
                  {activity.user && (
                    <>
                      <span>•</span>
                      <span>{activity.user.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune activité récente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
