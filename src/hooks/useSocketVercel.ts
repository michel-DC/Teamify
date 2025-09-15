"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { useAuth } from "./useAuth";
import {
  createSocketConnection,
  ServerToClientEvents,
  ClientToServerEvents,
  MessageData,
  MessageReadData,
} from "@/lib/socket-vercel";

// Réexporter les types pour l'utilisation externe
export type { MessageData, MessageReadData };

/**
 * Options de configuration pour le hook useSocketVercel
 */
interface UseSocketVercelOptions {
  autoConnect?: boolean;
  currentUserId?: string; // ID de l'utilisateur actuel pour les messages optimistes
  onMessage?: (message: MessageData) => void;
  onMessageRead?: (data: MessageReadData) => void;
  onError?: (error: { message: string; code?: string }) => void;
  onConversationJoined?: (data: { conversationId: string }) => void;
  onConversationLeft?: (data: { conversationId: string }) => void;
}

/**
 * Hook pour gérer la connexion Socket.IO compatible Vercel
 * Utilise uniquement le polling pour la compatibilité avec les fonctions serverless
 */
export const useSocketVercel = (options: UseSocketVercelOptions = {}) => {
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
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utiliser des refs pour les callbacks pour éviter les re-renders
  const onMessageRef = useRef(onMessage);
  const onMessageReadRef = useRef(onMessageRead);
  const onErrorRef = useRef(onError);
  const onConversationJoinedRef = useRef(onConversationJoined);
  const onConversationLeftRef = useRef(onConversationLeft);

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

  useEffect(() => {
    onConversationLeftRef.current = onConversationLeft;
  }, [onConversationLeft]);

  /**
   * Initialise la connexion Socket.IO compatible Vercel
   */
  const connect = useCallback(() => {
    if (!token || !isAuthenticated || socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Créer une nouvelle connexion Socket.IO optimisée pour Vercel
      const socket = createSocketConnection();

      // Gestion des événements de connexion
      socket.on("connect", () => {
        console.log("🔌 Socket.IO connecté (Vercel compatible)");
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 Socket.IO déconnecté:", reason);
        setIsConnected(false);
        setIsConnecting(false);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Erreur de connexion Socket.IO:", error);
        setError(error.message);
        setIsConnecting(false);
        setIsConnected(false);
      });

      // Gestion des événements de messagerie
      socket.on("message:new", (data) => {
        console.log("📨 Nouveau message reçu:", data);
        onMessageRef.current?.(data);
      });

      socket.on("message:read", (data) => {
        console.log("👁️ Message marqué comme lu:", data);
        onMessageReadRef.current?.(data);
      });

      socket.on("conversation:joined", (data) => {
        console.log("👥 Conversation rejointe:", data);
        onConversationJoinedRef.current?.(data);
      });

      socket.on("conversation:left", (data) => {
        console.log("👋 Conversation quittée:", data);
        onConversationLeftRef.current?.(data);
      });

      socket.on("error", (errorData) => {
        console.error("❌ Erreur Socket.IO:", errorData);
        setError(errorData.message);
        onErrorRef.current?.(errorData);
      });

      // Connecter le socket
      socket.connect();
      socketRef.current = socket;
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation Socket.IO:", error);
      setError("Erreur lors de l'initialisation de la connexion");
      setIsConnecting(false);
    }
  }, [token, isAuthenticated]);

  /**
   * Déconnecte le socket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 Déconnexion Socket.IO");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  /**
   * Envoie un message avec mise à jour optimiste
   */
  const sendMessage = useCallback(
    (data: { conversationId: string; content: string; attachments?: any }) => {
      if (!socketRef.current?.connected) {
        console.warn("⚠️ Socket non connecté, impossible d'envoyer le message");
        return false;
      }

      try {
        const userId = currentUserId || "current_user";

        // Créer un message temporaire pour l'UI optimiste
        const tempMessage: MessageData = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
          attachments: data.attachments,
          createdAt: new Date(),
          sender: {
            uid: userId,
            firstname: "Vous",
            lastname: "",
            profileImage: null,
          },
        };

        // Afficher le message temporaire immédiatement
        onMessageRef.current?.(tempMessage);

        // Envoyer le message via Socket.IO
        socketRef.current.emit("message:send", data);
        console.log("📤 Message envoyé via Socket.IO:", data);
        return true;
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi du message:", error);
        return false;
      }
    },
    [currentUserId]
  );

  /**
   * Marque un message comme lu
   */
  const markMessageAsRead = useCallback((messageId: string) => {
    if (!socketRef.current?.connected) {
      console.warn(
        "⚠️ Socket non connecté, impossible de marquer le message comme lu"
      );
      return false;
    }

    try {
      socketRef.current.emit("message:read", { messageId });
      console.log("👁️ Message marqué comme lu:", messageId);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors du marquage du message comme lu:", error);
      return false;
    }
  }, []);

  /**
   * Rejoint une conversation
   */
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      console.warn(
        "⚠️ Socket non connecté, impossible de rejoindre la conversation"
      );
      return false;
    }

    try {
      socketRef.current.emit("join:conversation", { conversationId });
      console.log("👥 Rejoindre la conversation:", conversationId);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la jonction à la conversation:", error);
      return false;
    }
  }, []);

  /**
   * Quitte une conversation
   */
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      console.warn(
        "⚠️ Socket non connecté, impossible de quitter la conversation"
      );
      return false;
    }

    try {
      socketRef.current.emit("leave:conversation", { conversationId });
      console.log("👋 Quitter la conversation:", conversationId);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la sortie de la conversation:", error);
      return false;
    }
  }, []);

  /**
   * Vérification de l'authentification au montage
   */
  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth();
      setIsAuthenticated(authResult.isAuthenticated);

      if (authResult.isAuthenticated) {
        setToken("authenticated");
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
    if (autoConnect && isAuthenticated && token) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
      }
    };
  }, [autoConnect, isAuthenticated, token, connect]);

  return {
    socket: socketRef.current,
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
