"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

/**
 * Types pour les événements Socket.IO côté client
 */
interface ServerToClientEvents {
  "message:new": (data: {
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
  }) => void;
  "message:read": (data: {
    messageId: string;
    userId: string;
    timestamp: Date;
  }) => void;
  "conversation:joined": (data: { conversationId: string }) => void;
  error: (data: { message: string; code?: string }) => void;
}

interface ClientToServerEvents {
  "message:send": (data: {
    conversationId: string;
    content: string;
    attachments?: any;
  }) => void;
  "message:read": (data: { messageId: string }) => void;
  "join:conversation": (data: { conversationId: string }) => void;
  "leave:conversation": (data: { conversationId: string }) => void;
}

interface SocketData {
  userId: string;
  userUid: string;
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
 * Options de configuration pour le hook useSocket
 */
interface UseSocketOptions {
  autoConnect?: boolean;
  onMessage?: (message: MessageData) => void;
  onMessageRead?: (data: MessageReadData) => void;
  onError?: (error: { message: string; code?: string }) => void;
  onConversationJoined?: (data: { conversationId: string }) => void;
}

/**
 * Hook pour gérer la connexion Socket.IO
 */
export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    autoConnect = true,
    onMessage,
    onMessageRead,
    onError,
    onConversationJoined,
  } = options;

  const { checkAuth, user, isAuthenticated: authIsAuthenticated } = useAuth();
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
   * Initialise la connexion Socket.IO
   */
  const connect = useCallback(() => {
    if (!token || !isAuthenticated || socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Créer la connexion Socket.IO
      const socket = io(
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_SOCKET_URL ||
              window.location.origin.replace("3000", "3001")
          : "http://localhost:3001",
        {
          auth: {
            token,
          },
          transports: ["websocket", "polling"],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        }
      );

      // Gestion des événements de connexion
      socket.on("connect", () => {
        console.log("[useSocket] Connecté au serveur Socket.IO");
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      });

      socket.on("disconnect", (reason) => {
        console.log("[useSocket] Déconnecté du serveur Socket.IO:", reason);
        setIsConnected(false);
        setIsConnecting(false);
      });

      socket.on("connect_error", (error) => {
        console.error("[useSocket] Erreur de connexion:", error);
        setError(error.message);
        setIsConnecting(false);
        setIsConnected(false);
      });

      // Gestion des événements métier
      socket.on("message:new", (data) => {
        console.log("[useSocket] Nouveau message reçu:", data);
        onMessageRef.current?.(data);
      });

      socket.on("message:read", (data) => {
        console.log("[useSocket] Message marqué comme lu:", data);
        onMessageReadRef.current?.(data);
      });

      socket.on("conversation:joined", (data) => {
        console.log("[useSocket] Conversation rejointe:", data);
        onConversationJoinedRef.current?.(data);
      });

      socket.on("error", (errorData) => {
        console.error("[useSocket] Erreur serveur:", errorData);
        setError(errorData.message);
        onErrorRef.current?.(errorData);
      });

      socketRef.current = socket;
    } catch (error) {
      console.error("[useSocket] Erreur lors de l'initialisation:", error);
      setError("Erreur lors de l'initialisation de la connexion");
      setIsConnecting(false);
    }
  }, [token, isAuthenticated]);

  /**
   * Déconnecte le socket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  /**
   * Envoie un message
   */
  const sendMessage = useCallback(
    (data: { conversationId: string; content: string; attachments?: any }) => {
      if (!socketRef.current?.connected) {
        console.error("[useSocket] Socket non connecté");
        return false;
      }

      try {
        socketRef.current.emit("message:send", data);
        return true;
      } catch (error) {
        console.error("[useSocket] Erreur lors de l'envoi du message:", error);
        return false;
      }
    },
    []
  );

  /**
   * Marque un message comme lu
   */
  const markMessageAsRead = useCallback((messageId: string) => {
    if (!socketRef.current?.connected) {
      console.error("[useSocket] Socket non connecté");
      return false;
    }

    try {
      socketRef.current.emit("message:read", { messageId });
      return true;
    } catch (error) {
      console.error("[useSocket] Erreur lors de la lecture du message:", error);
      return false;
    }
  }, []);

  /**
   * Rejoint une conversation
   */
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      console.error("[useSocket] Socket non connecté");
      return false;
    }

    try {
      socketRef.current.emit("join:conversation", { conversationId });
      return true;
    } catch (error) {
      console.error("[useSocket] Erreur lors de la jointure:", error);
      return false;
    }
  }, []);

  /**
   * Quitte une conversation
   */
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      console.error("[useSocket] Socket non connecté");
      return false;
    }

    try {
      socketRef.current.emit("leave:conversation", { conversationId });
      return true;
    } catch (error) {
      console.error("[useSocket] Erreur lors de la sortie:", error);
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

      // Récupérer le token depuis les cookies
      if (authResult.isAuthenticated) {
        // Récupérer le token JWT depuis les cookies
        const cookies = document.cookie.split(";");
        const tokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("token=")
        );

        if (tokenCookie) {
          const tokenValue = tokenCookie.split("=")[1];
          setToken(tokenValue);
          console.log(
            "[useSocket] Token JWT récupéré pour l'utilisateur:",
            user?.email
          );
        } else {
          // Fallback pour la démo
          setToken("demo_token");
          console.log("[useSocket] Utilisation du token de démo");
        }
      } else {
        setToken(null);
      }
    };

    verifyAuth();
  }, [checkAuth, user]);

  /**
   * Gestion de la connexion automatique
   */
  useEffect(() => {
    if (autoConnect && isAuthenticated && token) {
      connect();
    }

    // Nettoyage lors du démontage du composant
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
