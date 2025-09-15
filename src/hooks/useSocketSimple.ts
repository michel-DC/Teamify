"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";

/**
 * Types pour les messages
 */
export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: any;
  createdAt: string;
  sender: {
    uid: string;
    firstname: string | null;
    lastname: string | null;
    profileImage: string | null;
  };
}

export interface MessageReadData {
  messageId: string;
  userId: string;
  timestamp: string;
}

/**
 * Options de configuration pour le hook useSocketSimple
 */
interface UseSocketSimpleOptions {
  autoConnect?: boolean;
  currentUserId?: string;
  onMessage?: (message: MessageData) => void;
  onMessageRead?: (data: MessageReadData) => void;
  onError?: (error: { message: string; code?: string }) => void;
  onConversationJoined?: (data: { conversationId: string }) => void;
  onConversationLeft?: (data: { conversationId: string }) => void;
}

/**
 * Hook simplifié pour la messagerie en temps réel compatible Vercel
 * Utilise des requêtes HTTP simples au lieu de Socket.IO
 */
export const useSocketSimple = (options: UseSocketSimpleOptions = {}) => {
  const {
    autoConnect = true,
    currentUserId,
    onMessage,
    onMessageRead,
    onError,
    onConversationJoined,
    onConversationLeft,
  } = options;

  const { checkAuth } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentConversationRef = useRef<string | null>(null);

  // Utiliser des refs pour les callbacks
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onConversationJoinedRef = useRef(onConversationJoined);
  const onConversationLeftRef = useRef(onConversationLeft);

  // Mettre à jour les refs
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onConversationJoinedRef.current = onConversationJoined;
  }, [onConversationJoined]);

  useEffect(() => {
    onConversationLeftRef.current = onConversationLeft;
  }, [onConversationLeft]);

  /**
   * Se connecter à l'API
   */
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/socket-io-simple?action=connect&userId=${
          currentUserId || "anonymous"
        }`
      );
      const data = await response.json();

      if (data.success) {
        setConnectionId(data.connectionId);
        setIsConnected(true);
        setIsConnecting(false);
        console.log("🔌 Connexion établie:", data.connectionId);
      } else {
        throw new Error(data.error || "Erreur de connexion");
      }
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      setError(error instanceof Error ? error.message : "Erreur de connexion");
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, currentUserId]);

  /**
   * Se déconnecter
   */
  const disconnect = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionId(null);
    console.log("🔌 Déconnexion");
  }, []);

  /**
   * Démarrer le polling pour une conversation
   */
  const startPolling = useCallback((conversationId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log("🔄 Démarrage du polling pour:", conversationId);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/socket-io-simple?action=poll&conversationId=${conversationId}`
        );
        const data = await response.json();

        if (data.success && data.messages) {
          // Traiter les nouveaux messages
          data.messages.forEach((message: MessageData) => {
            onMessageRef.current?.(message);
          });
        }
      } catch (error) {
        console.error("❌ Erreur lors du polling:", error);
      }
    }, 2000); // Polling toutes les 2 secondes
  }, []);

  /**
   * Arrêter le polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log("🔄 Arrêt du polling");
    }
  }, []);

  /**
   * Envoyer un message
   */
  const sendMessage = useCallback(
    async (data: {
      conversationId: string;
      content: string;
      attachments?: any;
    }) => {
      if (!isConnected) {
        console.warn("⚠️ Non connecté, impossible d'envoyer le message");
        return false;
      }

      try {
        const response = await fetch("/api/socket-io-simple", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "send",
            conversationId: data.conversationId,
            message: {
              content: data.content,
              attachments: data.attachments,
            },
            userId: currentUserId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log("📤 Message envoyé:", result.messageId);
          return true;
        } else {
          throw new Error(result.error || "Erreur lors de l'envoi");
        }
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi du message:", error);
        onErrorRef.current?.({
          message: error instanceof Error ? error.message : "Erreur d'envoi",
        });
        return false;
      }
    },
    [isConnected, currentUserId]
  );

  /**
   * Marquer un message comme lu
   */
  const markMessageAsRead = useCallback((messageId: string) => {
    // Pour cette implémentation simple, on ne gère pas les accusés de réception
    console.log("👁️ Message marqué comme lu:", messageId);
    return true;
  }, []);

  /**
   * Rejoindre une conversation
   */
  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!isConnected) {
        console.warn(
          "⚠️ Non connecté, impossible de rejoindre la conversation"
        );
        return false;
      }

      try {
        const response = await fetch("/api/socket-io-simple", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "join",
            conversationId,
            userId: currentUserId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          currentConversationRef.current = conversationId;
          startPolling(conversationId);
          onConversationJoinedRef.current?.({ conversationId });
          console.log("👥 Conversation rejointe:", conversationId);
          return true;
        } else {
          throw new Error(result.error || "Erreur lors de la jonction");
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la jonction à la conversation:",
          error
        );
        return false;
      }
    },
    [isConnected, currentUserId, startPolling]
  );

  /**
   * Quitter une conversation
   */
  const leaveConversation = useCallback(
    async (conversationId: string) => {
      if (!isConnected) {
        console.warn("⚠️ Non connecté, impossible de quitter la conversation");
        return false;
      }

      try {
        const response = await fetch("/api/socket-io-simple", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "leave",
            conversationId,
            userId: currentUserId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          stopPolling();
          currentConversationRef.current = null;
          onConversationLeftRef.current?.({ conversationId });
          console.log("👋 Conversation quittée:", conversationId);
          return true;
        } else {
          throw new Error(result.error || "Erreur lors de la sortie");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la sortie de la conversation:", error);
        return false;
      }
    },
    [isConnected, currentUserId, stopPolling]
  );

  /**
   * Vérification de l'authentification
   */
  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth();
      setIsAuthenticated(authResult.isAuthenticated);
    };

    verifyAuth();
  }, [checkAuth]);

  /**
   * Connexion automatique
   */
  useEffect(() => {
    if (autoConnect && isAuthenticated && !isConnected && !isConnecting) {
      connect();
    }

    return () => {
      stopPolling();
    };
  }, [
    autoConnect,
    isAuthenticated,
    isConnected,
    isConnecting,
    connect,
    stopPolling,
  ]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
    markMessageAsRead,
    joinConversation,
    leaveConversation,
  };
};
