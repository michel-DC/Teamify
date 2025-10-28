"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useActiveOrganization } from "./useActiveOrganization";

export interface GroupConversation {
  id: string;
  type: "GROUP";
  title?: string;
  organizationId?: number;
  organization?: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  createdAt: Date;
  members: Array<{
    id: string;
    userId: string;
    role: "MEMBER" | "ADMIN";
    joinedAt: Date;
    user: {
      uid: string;
      firstname: string | null;
      lastname: string | null;
      profileImage: string | null;
    };
  }>;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      firstname: string | null;
      lastname: string | null;
    };
  };
  unreadCount: number;
}

interface UseGroupConversationsOptions {
  autoFetch?: boolean;
  autoSync?: boolean;
}

export const useGroupConversations = (
  options: UseGroupConversationsOptions = {}
) => {
  const { autoFetch = true, autoSync = true } = options;
  const { checkAuth } = useAuth();
  const { activeOrganization } = useActiveOrganization();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [conversations, setConversations] = useState<GroupConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupConversations = useCallback(async () => {
    if (!isAuthenticated || !activeOrganization) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${activeOrganization.id}/group-conversation`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des conversations de groupe"
        );
      }

      const data = await response.json();
      if (data.conversation) {
        setConversations([data.conversation]);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("[useGroupConversations] Erreur:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeOrganization]);

  const syncGroupMembers = useCallback(async () => {
    if (!activeOrganization) {
      return false;
    }

    try {
      const response = await fetch(
        `/api/organizations/${activeOrganization.id}/group-conversation/sync-members`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la synchronisation des membres");
      }

      const data = await response.json();

      if (data.conversation) {
        setConversations([data.conversation]);
      }

      return true;
    } catch (error) {
      console.error("[useGroupConversations] Erreur sync:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la synchronisation"
      );
      return false;
    }
  }, [activeOrganization]);

  const updateGroupConversationTitle = useCallback(
    async (title: string) => {
      if (!activeOrganization) {
        return false;
      }

      try {
        const response = await fetch(
          `/api/organizations/${activeOrganization.id}/group-conversation`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title }),
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du titre");
        }

        const data = await response.json();

        if (data.conversation) {
          setConversations([data.conversation]);
        }

        return true;
      } catch (error) {
        console.error(
          "[useGroupConversations] Erreur mise à jour titre:",
          error
        );
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour"
        );
        return false;
      }
    },
    [activeOrganization]
  );

  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth();
      setIsAuthenticated(authResult.isAuthenticated);
    };

    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (autoFetch && isAuthenticated && activeOrganization) {
      fetchGroupConversations();
    }
  }, [autoFetch, isAuthenticated, activeOrganization, fetchGroupConversations]);

  useEffect(() => {
    if (autoSync && isAuthenticated && activeOrganization) {
      const timer = setTimeout(() => {
        syncGroupMembers();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoSync, isAuthenticated, activeOrganization, syncGroupMembers]);

  return {
    conversations,
    isLoading,
    error,
    fetchGroupConversations,
    syncGroupMembers,
    updateGroupConversationTitle,
  };
};
