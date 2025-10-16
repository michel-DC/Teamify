"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface Conversation {
  id: string;
  type: "PRIVATE" | "GROUP";
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

interface UseConversationsOptions {
  autoFetch?: boolean;
  organizationId?: number;
}

export const useConversations = (options: UseConversationsOptions = {}) => {
  const { autoFetch = true, organizationId } = options;
  const { checkAuth } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (organizationId) {
        params.append("organizationId", organizationId.toString());
      }

      const response = await fetch(`/api/conversations?${params}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des conversations");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("[useConversations] Erreur:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, organizationId]);

  const createConversation = useCallback(
    async (data: {
      type: "PRIVATE" | "GROUP";
      title?: string;
      memberIds: string[];
      organizationId?: number;
    }) => {
      if (!isAuthenticated) {
        return null;
      }

      try {
        const response = await fetch("/api/conversations", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création de la conversation");
        }

        const newConversation = await response.json();

        await fetchConversations();

        return newConversation;
      } catch (error) {
        console.error("[useConversations] Erreur création:", error);
        setError(
          error instanceof Error ? error.message : "Erreur lors de la création"
        );
        return null;
      }
    },
    [isAuthenticated]
  );

  const addMemberToConversation = useCallback(
    async (conversationId: string, userId: string) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/members`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de l'ajout du membre");
        }

        await fetchConversations();

        return true;
      } catch (error) {
        console.error("[useConversations] Erreur ajout membre:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'ajout du membre"
        );
        return false;
      }
    },
    [fetchConversations]
  );

  const removeMemberFromConversation = useCallback(
    async (conversationId: string, userId: string) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/members/${userId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du membre");
        }

        await fetchConversations();

        return true;
      } catch (error) {
        console.error("[useConversations] Erreur suppression membre:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression du membre"
        );
        return false;
      }
    },
    [fetchConversations]
  );

  const updateConversation = useCallback(
    async (conversationId: string, data: { title?: string }) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour de la conversation");
        }

        const updatedConversation = await response.json();

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? updatedConversation : conv
          )
        );

        return updatedConversation;
      } catch (error) {
        console.error("[useConversations] Erreur mise à jour:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour"
        );
        return null;
      }
    },
    []
  );

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la conversation");
      }

      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      return true;
    } catch (error) {
      console.error("[useConversations] Erreur suppression:", error);
      setError(
        error instanceof Error ? error.message : "Erreur lors de la suppression"
      );
      return false;
    }
  }, []);

  const fetchMessages = useCallback(
    async (conversationId: string, page: number = 1, limit: number = 50) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des messages");
        }

        const data = await response.json();
        return data.messages || [];
      } catch (error) {
        console.error(
          "[useConversations] Erreur récupération messages:",
          error
        );
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des messages"
        );
        return [];
      }
    },
    []
  );

  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth();
      setIsAuthenticated(authResult.isAuthenticated);
    };

    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (autoFetch && isAuthenticated) {
      fetchConversations();
    }
  }, [autoFetch, isAuthenticated, fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    addMemberToConversation,
    removeMemberFromConversation,
    updateConversation,
    deleteConversation,
    fetchMessages,
  };
};
