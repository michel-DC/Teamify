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
 * Types pour les données des messages
 */
export interface MessageData {
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

export interface MessageReadData {
  messageId: string;
  userId: string;
  timestamp: Date;
}

/**
 * Options de configuration pour le hook usePolling
 */
interface UsePollingOptions {
  autoConnect?: boolean;
  currentUserId?: string;
  onMessage?: (message: MessageData) => void;
  onMessageRead?: (data: MessageReadData) => void;
  onError?: (error: { message: string; code?: string }) => void;
  onConversationJoined?: (data: { conversationId: string }) => void;
  pollingInterval?: number; // Intervalle de polling en ms (défaut: 2000)
}

/**
 * Hook pour gérer la communication en temps réel via polling
 */
export const usePolling = (options: UsePollingOptions = {}) => {
  const {
    autoConnect = true,
    currentUserId,
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

  // Mettre à jour les refs quand les callbacks changent
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

    // Polling immédiat
    pollMessages();

    // Puis polling régulier
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
        console.log("❌ [usePolling] No authenticated user for sending message");
        setError("Utilisateur non connecté");
        return false;
      }

      try {
        // Message optimiste
        if (onMessageRef.current && currentUser.uid) {
          const tempMessage: MessageData = {
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

        // En développement, utiliser l'API de polling
        if (process.env.NODE_ENV === "development") {
          if (!currentUserId) {
            console.log(
              "❌ [usePolling] No currentUserId provided for sending message"
            );
            setError("Utilisateur non connecté");
            return false;
          }

          const senderId = currentUserId;
          console.log(
            "🔧 [usePolling] Development mode - using polling API with senderId:",
            senderId
          );

          const messageData = {
            id: `dev_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId: data.conversationId,
            senderId: senderId,
            content: data.content,
            attachments: data.attachments,
            createdAt: new Date().toISOString(),
            sender: {
              uid: senderId,
              firstname: "Dev",
              lastname: "User",
              profileImage: null,
            },
          };

          console.log(
            "📨 [usePolling] Sending message data to /api/polling:",
            messageData
          );

          const response = await fetch("/api/polling", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              type: "message:new",
              data: messageData,
              userId: senderId,
            }),
          });

          console.log("📡 [usePolling] Polling API response:", {
            status: response.status,
            ok: response.ok,
          });

          if (response.ok) {
            const responseData = await response.json();
            console.log(
              "✅ [usePolling] Message sent successfully:",
              responseData
            );

            // Sauvegarder le message en base de données
            try {
              const saveResponse = await fetch("/api/messages/save", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  conversationId: data.conversationId,
                  content: data.content,
                  attachments: data.attachments,
                  senderId: senderId,
                }),
              });

              if (saveResponse.ok) {
                const savedMessage = await saveResponse.json();
                console.log(
                  "💾 [usePolling] Message saved to database:",
                  savedMessage.id
                );
              } else {
                console.log(
                  "⚠️ [usePolling] Failed to save message to database"
                );
              }
            } catch (saveError) {
              console.log(
                "⚠️ [usePolling] Error saving message to database:",
                saveError
              );
            }

            return true;
          } else {
            const errorData = await response.json();
            console.log("❌ [usePolling] Error sending message:", errorData);
            setError(errorData.error || "Erreur lors de l'envoi");
            return false;
          }
        }

        // En production, utiliser l'API d'envoi de messages
        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });

        if (response.ok) {
          return true;
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Erreur lors de l'envoi");
          return false;
        }
      } catch (error) {
        console.error("❌ Error sending message:", error);
        setError("Erreur lors de l'envoi du message");
        return false;
      }
    },
    [token, currentUserId]
  );

  /**
   * Marquer un message comme lu
   */
  const markMessageAsRead = useCallback(
    async (messageId: string) => {
      if (!token) {
        return false;
      }

      try {
        const response = await fetch("/api/messages/read", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ messageId }),
        });

        return response.ok;
      } catch (error) {
        console.error("❌ Error marking message as read:", error);
        return false;
      }
    },
    [token]
  );

  /**
   * Rejoindre une conversation (simulé via polling)
   */
  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!token) {
        return false;
      }

      try {
        // Simuler la jointure via l'API de polling
        const response = await fetch("/api/polling", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            type: "conversation:joined",
            data: { conversationId },
            userId: currentUserId,
          }),
        });

        if (response.ok) {
          onConversationJoinedRef.current?.({ conversationId });
          return true;
        }
        return false;
      } catch (error) {
        console.error("❌ Error joining conversation:", error);
        return false;
      }
    },
    [token, currentUserId]
  );

  /**
   * Quitter une conversation (simulé)
   */
  const leaveConversation = useCallback((conversationId: string) => {
    // Pour le polling, on ne fait rien de spécial
    console.log(`🚪 Left conversation: ${conversationId}`);
    return true;
  }, []);

  /**
   * Vérification de l'authentification au montage
   */
  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth();
      setIsAuthenticated(authResult.isAuthenticated);

      if (authResult.isAuthenticated) {
        // En développement, utiliser le vrai token si disponible
        if (process.env.NODE_ENV === "development" && authResult.user?.uid) {
          setToken("dev-token");
          console.log(
            "🔧 [usePolling] Development mode - using real user ID:",
            authResult.user.uid
          );
        } else {
          setToken("authenticated");
        }
      } else {
        setToken(null);
      }
    };

    verifyAuth();
  }, [checkAuth]);

  /**
   * Gestion de la connexion automatique
   */
  useEffect(() => {
    // Se connecter seulement si currentUserId est fourni
    if (autoConnect && isAuthenticated && token && currentUserId) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [
    autoConnect,
    isAuthenticated,
    token,
    currentUserId,
    startPolling,
    stopPolling,
  ]);

  return {
    isConnected,
    isConnecting,
    error,
    connect: startPolling,
    disconnect: stopPolling,
    sendMessage,
    markMessageAsRead,
    joinConversation,
    leaveConversation,
  };
};
