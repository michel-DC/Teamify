"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Calendar,
  Users,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Mail,
  Clock,
  Edit,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Composant pour afficher l'icône du type de notification
 */
function NotificationTypeIcon({
  type,
}: {
  type: Notification["notificationType"];
}) {
  const iconProps = { className: "h-4 w-4" };

  switch (type) {
    case "SUCCESS":
      return <CheckCircle {...iconProps} style={{ color: "#6D5DE6" }} />;
    case "WARNING":
      return <AlertTriangle {...iconProps} style={{ color: "#FCA7DB" }} />;
    case "ERROR":
      return <XCircle {...iconProps} style={{ color: "#020102" }} />;
    case "INVITATION":
      return <Mail {...iconProps} style={{ color: "#3B82F6" }} />;
    case "REMINDER":
      return <Clock {...iconProps} style={{ color: "#F59E42" }} />;
    case "UPDATE":
      return <Edit {...iconProps} style={{ color: "#22C55E" }} />;
    default:
      return <Info {...iconProps} style={{ color: "#6B7280" }} />;
  }
}

/**
 * Composant pour afficher le badge du type de notification
 */
function NotificationTypeBadge({
  type,
}: {
  type: Notification["notificationType"];
}) {
  const variants = {
    INFO: "secondary",
    SUCCESS: "default",
    WARNING: "destructive",
    ERROR: "destructive",
    INVITATION: "default",
    REMINDER: "outline",
    UPDATE: "secondary",
  } as const;

  const labels = {
    INFO: "Information",
    SUCCESS: "Succès",
    WARNING: "Attention",
    ERROR: "Erreur",
    INVITATION: "Invitation",
    REMINDER: "Rappel",
    UPDATE: "Mise à jour",
  };

  return (
    <Badge variant={variants[type]} className="text-xs">
      {labels[type]}
    </Badge>
  );
}

/**
 * Composant pour une notification individuelle
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <main>
      <Card
        className={`transition-all duration-200 ${
          !notification.isRead
            ? "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
            : "opacity-75"
        } ${isHovered ? "shadow-md" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <NotificationTypeIcon type={notification.notificationType} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-medium ${
                      !notification.isRead ? "font-semibold" : ""
                    }`}
                  >
                    {notification.notificationName}
                  </h4>
                  <NotificationTypeBadge type={notification.notificationType} />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.notificationDescription}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(
                      new Date(notification.notificationDate),
                      "dd MMM yyyy à HH:mm",
                      { locale: fr }
                    )}
                  </div>
                  {notification.event && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Événement: {notification.event.title}
                    </div>
                  )}
                  {notification.organization && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Organisation: {notification.organization.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.publicId)}
                  className="h-8 w-8 p-0"
                  title="Marquer comme lu"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.publicId)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.isRead;
    }
    return true;
  });

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      toast.info("Aucune notification non lue");
      return;
    }
    await markAllAsRead();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erreur</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec breadcrumb */}
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

      <div className="container mx-auto p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
            </h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} notification${
                    unreadCount > 1 ? "s" : ""
                  } non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes vos notifications sont à jour"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={refreshNotifications}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Toutes ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Non lues ({unreadCount})
          </Button>
        </div>

        <Separator />

        {/* Liste des notifications */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-4 w-4 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === "unread"
                  ? "Aucune notification non lue"
                  : "Aucune notification"}
              </h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "Vous êtes à jour ! Toutes vos notifications ont été lues."
                  : "Vous n'avez pas encore de notifications."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div key={notification.publicId} className="group">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
