"use client";

import { useState, useEffect, useCallback } from "react";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: any;
  createdAt: Date;
  sender: {
    uid: string;
    firstname: string | null;
    lastname: string | null;
    profileImage: string | null;
  };
}

interface UseMessagesOptions {
  conversationId?: string;
  autoFetch?: boolean;
}

export const useMessages = (options: UseMessagesOptions = {}) => {
  const { conversationId, autoFetch = true } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/messages?conversationId=${conversationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error(
        "[useMessages] Erreur lors de la récupération des messages:",
        err
      );
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      const messageExists = prev.some((msg) => msg.id === message.id);
      if (messageExists) {
        return prev;
      }

      if (message.id.startsWith("temp_")) {
        return [...prev, message];
      }

      const hasOptimisticMessage = prev.some(
        (msg) =>
          msg.id.startsWith("temp_") &&
          msg.conversationId === message.conversationId &&
          msg.content === message.content
      );

      if (hasOptimisticMessage) {
        // Remplacer le message optimiste par le vrai message
        return prev.map((msg) =>
          msg.id.startsWith("temp_") &&
          msg.conversationId === message.conversationId &&
          msg.content === message.content
            ? message
            : msg
        );
      }

      return [...prev, message];
    });
  }, []);

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) {
        return false;
      }

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages/${messageId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        removeMessage(messageId);
        return true;
      } catch (err) {
        console.error(
          "[useMessages] Erreur lors de la suppression du message:",
          err
        );
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    [conversationId, removeMessage]
  );

  /**
   * Effet pour récupérer les messages automatiquement
   */
  useEffect(() => {
    if (autoFetch && conversationId) {
      fetchMessages();
    }
  }, [conversationId, autoFetch, fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    addMessage,
    updateMessage,
    removeMessage,
    deleteMessage,
  };
};
