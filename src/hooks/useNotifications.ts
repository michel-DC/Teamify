"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Notification {
  id: number;
  publicId: string;
  notificationName: string;
  notificationDescription: string;
  notificationDate: string;
  isRead: boolean;
  notificationType:
    | "INFO"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "INVITATION"
    | "REMINDER"
    | "UPDATE";
  eventPublicId?: string;
  organizationPublicId?: string;
  userUid: string;
  createdAt: string;
  updatedAt: string;
  event?: {
    title: string;
    publicId: string;
  };
  organization?: {
    name: string;
    publicId: string;
  };
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

/**
 * Hook pour gérer les notifications de l'utilisateur
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les notifications depuis l'API
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        "/api/notifications?includeUnreadCount=true",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur lors de la récupération des notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Récupère uniquement le nombre de notifications non lues
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du comptage des notifications");
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Erreur lors du comptage des notifications:", err);
    }
  }, []);

  /**
   * Marque une notification comme lue
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la notification");
      }

      // Mettre à jour l'état local
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.publicId === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Décrémenter le compteur
      setUnreadCount((prev) => Math.max(0, prev - 1));

      toast.success("Notification marquée comme lue");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(errorMessage);
      console.error("Erreur lors de la mise à jour de la notification:", err);
    }
  }, []);

  /**
   * Marque toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/all", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des notifications");
      }

      // Mettre à jour l'état local
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      setUnreadCount(0);
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(errorMessage);
      console.error("Erreur lors de la mise à jour des notifications:", err);
    }
  }, []);

  /**
   * Supprime une notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression de la notification");
        }

        // Mettre à jour l'état local
        const notificationToDelete = notifications.find(
          (n) => n.publicId === notificationId
        );
        setNotifications((prev) =>
          prev.filter((n) => n.publicId !== notificationId)
        );

        // Décrémenter le compteur si la notification n'était pas lue
        if (notificationToDelete && !notificationToDelete.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        toast.success("Notification supprimée");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        toast.error(errorMessage);
        console.error("Erreur lors de la suppression de la notification:", err);
      }
    },
    [notifications]
  );

  /**
   * Actualise les notifications
   */
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Actualise le compteur de notifications non lues
   */
  const refreshUnreadCount = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    refreshUnreadCount,
  };
}
