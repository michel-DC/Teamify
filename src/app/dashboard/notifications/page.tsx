"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  Building2,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface Notification {
  id: number;
  notificationName: string;
  notificationDescription: string;
  notificationType:
    | "INFO"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "INVITATION"
    | "REMINDER"
    | "UPDATE";
  isRead: boolean;
  createdAt: string;
  event?: {
    title: string;
    publicId: string;
  };
  organization?: {
    name: string;
    publicId: string;
  };
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

/**
 * Icône correspondant au type de notification
 */
const getNotificationIcon = (type: Notification["notificationType"]) => {
  const iconProps = { className: "h-5 w-5", style: { color: "#7C3AED" } };

  switch (type) {
    case "SUCCESS":
      return <CheckCircle {...iconProps} />;
    case "WARNING":
      return <AlertCircle {...iconProps} />;
    case "ERROR":
      return <XCircle {...iconProps} />;
    case "INVITATION":
      return <Bell {...iconProps} />;
    case "REMINDER":
      return <Calendar {...iconProps} />;
    case "UPDATE":
      return <Info {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

/**
 * Couleur du badge selon le type de notification
 */
const getNotificationBadgeColor = () => {
  return "bg-[#7C3AED] text-white";
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  /**
   * Récupère les notifications de l'utilisateur
   */
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data: NotificationsResponse = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        toast.error("Erreur lors du chargement des notifications");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      toast.error("Erreur lors du chargement des notifications");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Marque toutes les notifications comme lues
   */
  const markAllAsRead = async () => {
    setMarkingAsRead(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
        toast.success("Toutes les notifications ont été marquées comme lues");
      } else {
        toast.error("Erreur lors de la mise à jour des notifications");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des notifications:", error);
      toast.error("Erreur lors de la mise à jour des notifications");
    } finally {
      setMarkingAsRead(false);
    }
  };

  /**
   * Marque une notification comme lue
   */
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification:", error);
    }
  };

  /**
   * Supprime une notification
   */
  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
        toast.success("Notification supprimée");
      } else {
        toast.error("Erreur lors de la suppression de la notification");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      toast.error("Erreur lors de la suppression de la notification");
    }
  };

  /**
   * Formate la date de création
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "À l'instant";
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInHours < 48) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Bell className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement des notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Notifications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="container mx-auto py-8 px-4 lg:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} notification${
                    unreadCount > 1 ? "s" : ""
                  } non lue${unreadCount > 1 ? "s" : ""}`
                : "Aucune notification non lue"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              disabled={markingAsRead}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {markingAsRead ? "Marquage..." : "Tout marquer comme lu"}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune notification
              </h3>
              <p className="text-muted-foreground text-center">
                Vous n'avez pas encore de notifications. Elles apparaîtront ici
                lorsque des événements ou des organisations seront créés ou
                modifiés.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 ${
                  !notification.isRead ? " bg-background" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.notificationType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {notification.notificationName}
                          </h3>
                          <Badge
                            className={getNotificationBadgeColor(
                              notification.notificationType
                            )}
                          >
                            {notification.notificationType}
                          </Badge>
                          {!notification.isRead && (
                            <Badge
                              variant="secondary"
                              className="bg-[#7C3AED] text-white"
                            >
                              Non lu
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {notification.notificationDescription}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(notification.createdAt)}
                          </span>
                          {notification.event && (
                            <Link
                              href={`/dashboard/events/details/${notification.event.publicId}`}
                              className="flex items-center gap-1"
                              style={{ color: "#7C3AED" }}
                            >
                              <Calendar
                                className="h-4 w-4"
                                style={{ color: "#7C3AED" }}
                              />
                              {notification.event.title}
                            </Link>
                          )}
                          {notification.organization && (
                            <Link
                              href={`/dashboard/organizations/${notification.organization.publicId}`}
                              className="flex items-center gap-1"
                              style={{ color: "#7C3AED" }}
                            >
                              <Building2
                                className="h-4 w-4"
                                style={{ color: "#7C3AED" }}
                              />
                              {notification.organization.name}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-[#020102] hover:text-[#312e31]"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
