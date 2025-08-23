"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  X,
  Mail,
  Calendar,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeOrganization } = useActiveOrganization();

  useEffect(() => {
    const generateNotifications = async () => {
      if (!activeOrganization) return;

      try {
        // Récupération des événements pour générer des notifications basées sur les vraies données
        const response = await fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        );
        const data = await response.json();

        if (data.events) {
          const events = data.events;
          const now = new Date();

          // Génération de notifications basées sur les événements réels
          const realNotifications: Notification[] = [];

          // Notification pour les événements à venir
          const upcomingEvents = events.filter(
            (event: any) =>
              new Date(event.startDate) > now &&
              new Date(event.startDate) <
                new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          );

          if (upcomingEvents.length > 0) {
            const nextEvent = upcomingEvents[0];
            const daysUntil = Math.ceil(
              (new Date(nextEvent.startDate).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            realNotifications.push({
              id: "upcoming-event",
              type: "warning",
              title: "Événement approche",
              message: `"${nextEvent.title}" commence dans ${daysUntil} jour${
                daysUntil > 1 ? "s" : ""
              }. Vérifiez les préparatifs.`,
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              read: false,
              action: {
                label: "Voir détails",
                href: `/dashboard/events/details/${nextEvent.eventCode}`,
              },
            });
          }

          // Notification pour les événements récents
          const recentEvents = events.filter(
            (event: any) =>
              new Date(event.createdAt || event.startDate) >
              new Date(now.getTime() - 24 * 60 * 60 * 1000)
          );

          if (recentEvents.length > 0) {
            realNotifications.push({
              id: "recent-event",
              type: "success",
              title: "Nouvel événement créé",
              message: `"${recentEvents[0].title}" a été créé avec succès.`,
              timestamp: new Date(
                Date.now() - 4 * 60 * 60 * 1000
              ).toISOString(),
              read: false,
              action: {
                label: "Gérer",
                href: `/dashboard/events/details/${recentEvents[0].eventCode}`,
              },
            });
          }

          // Notification pour les événements brouillons
          const draftEvents = events.filter(
            (event: any) => event.status === "BROUILLON"
          );

          if (draftEvents.length > 0) {
            realNotifications.push({
              id: "draft-events",
              type: "info",
              title: "Événements en brouillon",
              message: `${draftEvents.length} événement${
                draftEvents.length > 1 ? "s" : ""
              } en attente de publication.`,
              timestamp: new Date(
                Date.now() - 6 * 60 * 60 * 1000
              ).toISOString(),
              read: true,
            });
          }

          // Notification pour les événements terminés
          const completedEvents = events.filter(
            (event: any) =>
              new Date(event.endDate) < now &&
              new Date(event.endDate) >
                new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          );

          if (completedEvents.length > 0) {
            realNotifications.push({
              id: "completed-events",
              type: "success",
              title: "Événements terminés",
              message: `${completedEvents.length} événement${
                completedEvents.length > 1 ? "s" : ""
              } se sont bien déroulés cette semaine.`,
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
              read: true,
            });
          }

          // Notification générale sur l'activité
          if (events.length > 0) {
            realNotifications.push({
              id: "activity-summary",
              type: "info",
              title: "Résumé d'activité",
              message: `Votre organisation a organisé ${
                events.length
              } événement${events.length > 1 ? "s" : ""} au total.`,
              timestamp: new Date(
                Date.now() - 8 * 60 * 60 * 1000
              ).toISOString(),
              read: true,
            });
          }

          setNotifications(realNotifications);
        } else {
          // Fallback si pas d'événements
          setNotifications([
            {
              id: "welcome",
              type: "info",
              title: "Bienvenue !",
              message: "Commencez par créer votre premier événement.",
              timestamp: new Date().toISOString(),
              read: false,
              action: {
                label: "Créer un événement",
                href: "/dashboard/events/new",
              },
            },
          ]);
        }
      } catch (error) {
        console.error("Erreur lors de la génération des notifications:", error);
        // Fallback en cas d'erreur
        setNotifications([
          {
            id: "error",
            type: "error",
            title: "Erreur de chargement",
            message: "Impossible de charger les notifications.",
            timestamp: new Date().toISOString(),
            read: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    generateNotifications();
  }, [activeOrganization]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "border-blue-200 bg-blue-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return "Plus de 24h";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Tout marquer comme lu
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.read
                    ? "bg-white"
                    : getNotificationColor(notification.type)
                } ${!notification.read ? "border-l-4" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`text-sm font-medium ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      {notification.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            markAsRead(notification.id);
                            // Navigation serait gérée ici
                          }}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
