"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getCurrentUserFromCookies } from "@/lib/auth-utils";

/**
 * Types pour les événements de polling
 */
interface PollingMessage {
  id: string;
  type:
    | "message:new"
    | "message:read"
    | "conversation:joined"
    | "error"
    | "pong"
    | "welcome";
  data: any;
  timestamp: string;
  userId: string;
  conversationId?: string;
}

/**
 * Options de configuration pour le hook usePolling
 */
interface UsePollingOptions {
  autoConnect?: boolean;
  currentUserId?: string; // Optionnel, sera récupéré via l'authentification
  onMessage?: (message: any) => void;
  onMessageRead?: (data: any) => void;
  onError?: (error: { message: string; code?: string }) => void;
  onConversationJoined?: (data: { conversationId: string }) => void;
  pollingInterval?: number;
}

/**
 * Hook pour gérer la communication en temps réel via polling
 * Compatible avec Vercel et les API Routes Next.js
 */
export const usePolling = (options: UsePollingOptions = {}) => {
  const {
    autoConnect = true,
    currentUserId, // Optionnel, sera récupéré via l'authentification
    onMessage,
    onMessageRead,
    onError,
    onConversationJoined,
    pollingInterval = 2000,
  } = options;

  const { checkAuth } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  // Utiliser des refs pour les callbacks pour éviter les re-renders
  const onMessageRef = useRef(onMessage);
  const onMessageReadRef = useRef(onMessageRead);
  const onErrorRef = useRef(onError);
  const onConversationJoinedRef = useRef(onConversationJoined);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  useEffect(() => {
    onMessageReadRef.current = onMessageRead;
  }, [onMessageRead]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    onConversationJoinedRef.current = onConversationJoined;
  }, [onConversationJoined]);

  /**
   * Traiter un message reçu via polling
   */
  const handlePollingMessage = useCallback((message: PollingMessage) => {
    console.log("🎯 [usePolling] handlePollingMessage called with:", message);

    switch (message.type) {
      case "message:new":
        console.log("📨 [usePolling] Processing new message:", message.data);
        onMessageRef.current?.(message.data);
        break;
      case "message:read":
        console.log("👁️ [usePolling] Processing message read:", message.data);
        onMessageReadRef.current?.(message.data);
        break;
      case "conversation:joined":
        console.log(
          "🏠 [usePolling] Processing conversation joined:",
          message.data
        );
        onConversationJoinedRef.current?.(message.data);
        break;
      case "error":
        console.log("❌ [usePolling] Processing error:", message.data);
        setError(message.data.message);
        onErrorRef.current?.(message.data);
        break;
      case "pong":
        console.log("📡 [usePolling] Pong received:", message.data);
        break;
      case "welcome":
        console.log("👋 [usePolling] Welcome message:", message.data);
        break;
      default:
        console.log("❓ [usePolling] Unknown message type:", message.type);
    }
  }, []);

  /**
   * Effectuer un polling pour récupérer les messages
   */
  const pollMessages = useCallback(async () => {
    if (!isPollingRef.current) {
      console.log("⏸️ [usePolling] Polling skipped:", {
        isPolling: isPollingRef.current,
      });
      return;
    }

    try {
      // Utiliser l'utilisateur authentifié
      if (!currentUser?.uid) {
        console.log("❌ [usePolling] No authenticated user for polling");
        return;
      }

      const userId = currentUser.uid;
      console.log("🔍 [usePolling] Polling messages for userId:", userId);

      const response = await fetch(
        `/api/polling?userId=${userId}&timeout=5000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important pour envoyer les cookies
        }
      );

      console.log("📡 [usePolling] Polling response:", {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📥 [usePolling] Received messages:", {
          count: data.messages?.length || 0,
          messages: data.messages,
        });

        if (data.messages && data.messages.length > 0) {
          data.messages.forEach((message: PollingMessage) => {
            console.log("🔄 [usePolling] Processing message:", message);
            handlePollingMessage(message);
          });
        }
      } else {
        console.error("❌ [usePolling] Polling error:", response.status);
        setError("Erreur de connexion au serveur");
      }
    } catch (error) {
      console.error("❌ [usePolling] Polling error:", error);
      setError("Erreur de connexion au serveur");
    }
  }, [currentUser, handlePollingMessage]);

  /**
   * Démarrer le polling
   */
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;

    isPollingRef.current = true;
    setIsConnecting(true);
    setError(null);

    pollMessages();

    pollingRef.current = setInterval(pollMessages, pollingInterval);
    setIsConnected(true);
    setIsConnecting(false);
  }, [pollMessages, pollingInterval]);

  /**
   * Arrêter le polling
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    isPollingRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  /**
   * Se connecter
   */
  const connect = useCallback(() => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);
    startPolling();
  }, [isConnected, isConnecting, startPolling]);

  /**
   * Se déconnecter
   */
  const disconnect = useCallback(() => {
    stopPolling();
  }, [stopPolling]);

  /**
   * Envoyer un message
   */
  const sendMessage = useCallback(
    async (data: {
      conversationId: string;
      content: string;
      attachments?: any;
    }) => {
      console.log("🚀 [usePolling] sendMessage called with:", {
        conversationId: data.conversationId,
        content: data.content,
        currentUser: currentUser?.uid,
      });

      if (!currentUser?.uid) {
        console.log(
          "❌ [usePolling] No authenticated user for sending message"
        );
        setError("Utilisateur non connecté");
        return false;
      }

      try {
        // Message optimiste
        if (onMessageRef.current && currentUser.uid) {
          const tempMessage = {
            id: `temp_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId: data.conversationId,
            senderId: currentUser.uid,
            content: data.content,
            attachments: data.attachments,
            createdAt: new Date(),
            sender: {
              uid: currentUser.uid,
              firstname: currentUser.firstname || "Vous",
              lastname: currentUser.lastname || "",
              profileImage: currentUser.profileImage,
            },
          };
          console.log(
            "📤 [usePolling] Sending optimistic message:",
            tempMessage
          );
          onMessageRef.current(tempMessage);
        } else {
          console.log("⚠️ [usePolling] Cannot send optimistic message:", {
            hasOnMessageRef: !!onMessageRef.current,
            hasCurrentUser: !!currentUser,
          });
        }

        // Envoyer le message via l'API de messages (comme dans l'ancien système)
        const senderId = currentUser.uid;
        console.log(
          "🔧 [usePolling] Sending message via API with senderId:",
          senderId
        );

        // Utiliser l'API de messages comme dans l'ancien système server.js
        const response = await fetch(
          `/api/conversations/${data.conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Important pour envoyer les cookies
            body: JSON.stringify({
              content: data.content,
              attachments: data.attachments,
            }),
          }
        );

        console.log("📡 [usePolling] Messages API response:", {
          status: response.status,
          ok: response.ok,
        });

        if (response.ok) {
          const messageData = await response.json();
          console.log(
            "✅ [usePolling] Message sent successfully:",
            messageData.id
          );

          // Le message sera automatiquement diffusé via le polling
          return true;
        } else {
          const errorData = await response.json();
          console.log("❌ [usePolling] Error sending message:", errorData);
          setError(errorData.error || "Erreur lors de l'envoi");
          return false;
        }
      } catch (err: any) {
        console.error("❌ [usePolling] Error sending message:", err);
        setError(err.message || "Erreur lors de l'envoi");
        return false;
      }
    },
    [currentUser]
  );

  /**
   * Marquer un message comme lu
   */
  const markMessageAsRead = useCallback(
    async (messageId: string) => {
      if (!currentUser?.uid) {
        console.log(
          "❌ [usePolling] No authenticated user for marking message as read"
        );
        setError("Utilisateur non connecté");
        return false;
      }

      try {
        const response = await fetch("/api/messages/read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ messageId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log(
            "❌ [usePolling] Error marking message as read:",
            errorData
          );
          setError(errorData.error || "Erreur lors de la mise à jour");
          return false;
        }
        return true;
      } catch (err: any) {
        console.error("❌ [usePolling] Error marking message as read:", err);
        setError(err.message || "Erreur lors de la mise à jour");
        return false;
      }
    },
    [currentUser]
  );

  /**
   * Rejoindre une conversation
   */
  const joinConversation = useCallback(async (conversationId: string) => {
    console.log(`🏠 [usePolling] Joining conversation: ${conversationId}`);
    // Pour le polling, on ne fait rien de spécial
    onConversationJoinedRef.current?.({ conversationId });
    return true;
  }, []);

  /**
   * Quitter une conversation
   */
  const leaveConversation = useCallback((conversationId: string) => {
    console.log(`🚪 [usePolling] Left conversation: ${conversationId}`);
    return true;
  }, []);

  /**
   * Vérification de l'authentification au montage
   */
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Utiliser l'authentification via cookies comme dans l'ancien système
        const user = await getCurrentUserFromCookies();

        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          console.log("✅ [usePolling] User authenticated:", user.uid);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          console.log("❌ [usePolling] User not authenticated");
        }
      } catch (error) {
        console.error("❌ [usePolling] Error verifying auth:", error);
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  /**
   * Gestion de la connexion automatique
   */
  useEffect(() => {
    // Se connecter seulement si l'utilisateur est authentifié
    if (autoConnect && isAuthenticated && currentUser?.uid) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoConnect, isAuthenticated, currentUser, startPolling, stopPolling]);

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
