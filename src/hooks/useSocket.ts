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
  currentUserId?: string; // ID de l'utilisateur actuel pour les messages optimistes
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
    currentUserId,
    onMessage,
    onMessageRead,
    onError,
    onConversationJoined,
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
      // Déterminer l'URL du serveur Socket.IO
      const isProduction = process.env.NODE_ENV === "production";
      const isLocalhost =
        typeof window !== "undefined" &&
        window.location.hostname === "localhost";

      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        "https://teamify-socket-server.up.railway.app";

      // Log pour le débogage
      if (process.env.NODE_ENV === "development") {
        console.log("🔌 Connexion Socket.IO:", {
          environment: process.env.NODE_ENV,
          socketUrl,
          isProduction,
          hasEnvVar: !!process.env.NEXT_PUBLIC_SOCKET_URL,
        });
      }

      const socket = io(socketUrl, {
        path: "/socket.io/",
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      });

      socket.on("disconnect", (reason) => {
        setIsConnected(false);
        setIsConnecting(false);
      });

      socket.on("connect_error", (error) => {
        setError(error.message);
        setIsConnecting(false);
        setIsConnected(false);
      });

      socket.on("message:new", (data) => {
        onMessageRef.current?.(data);
      });

      socket.on("message:read", (data) => {
        onMessageReadRef.current?.(data);
      });

      socket.on("conversation:joined", (data) => {
        onConversationJoinedRef.current?.(data);
      });

      socket.on("error", (errorData) => {
        setError(errorData.message);
        onErrorRef.current?.(errorData);
      });

      socketRef.current = socket;
    } catch (error) {
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
   * Envoie un message avec mise à jour optimiste
   */
  const sendMessage = useCallback(
    (data: { conversationId: string; content: string; attachments?: any }) => {
      if (!socketRef.current?.connected) {
        return false;
      }

      try {
        const userId = currentUserId || "current_user";

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

        onMessageRef.current?.(tempMessage);
        socketRef.current.emit("message:send", data);
        return true;
      } catch (error) {
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
      return false;
    }

    try {
      socketRef.current.emit("message:read", { messageId });
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  /**
   * Rejoint une conversation
   */
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      return false;
    }

    try {
      socketRef.current.emit("join:conversation", { conversationId });
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  /**
   * Quitte une conversation
   */
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      return false;
    }

    try {
      socketRef.current.emit("leave:conversation", { conversationId });
      return true;
    } catch (error) {
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
