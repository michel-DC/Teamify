"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Types pour les messages
 */
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

/**
 * Options pour le hook useMessages
 */
interface UseMessagesOptions {
  conversationId?: string;
  autoFetch?: boolean;
}

/**
 * Hook pour gérer les messages d'une conversation
 */
export const useMessages = (options: UseMessagesOptions = {}) => {
  const { conversationId, autoFetch = true } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupérer les messages d'une conversation
   */
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(data.messages || []);
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

  /**
   * Ajouter un nouveau message à la liste avec gestion des messages optimistes
   */
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Si c'est un message optimiste (ID commence par "temp_"), le remplacer
      if (message.id.startsWith("temp_")) {
        return [...prev, message];
      }

      // Si c'est un message du serveur, vérifier s'il y a un message optimiste à remplacer
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

      // Sinon, ajouter le message normalement
      return [...prev, message];
    });
  }, []);

  /**
   * Mettre à jour un message existant
   */
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  /**
   * Supprimer un message
   */
  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

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
  };
};
