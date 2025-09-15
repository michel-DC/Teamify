import { io, Socket } from "socket.io-client";

/**
 * Configuration Socket.IO optimisée pour Vercel
 * Utilise uniquement le polling (pas de WebSockets) pour la compatibilité avec les fonctions serverless
 */
export const createSocketConnection = (): Socket => {
  const socketUrl =
    process.env.NODE_ENV === "production"
      ? window.location.origin
      : "http://localhost:3000";

  console.log("🔌 Création de la connexion Socket.IO vers:", socketUrl);

  return io(socketUrl, {
    withCredentials: false, // Désactiver les credentials pour éviter les problèmes CORS
    transports: ["polling"], // Utilise uniquement le polling pour Vercel
    autoConnect: false, // Connexion manuelle pour un meilleur contrôle
    reconnection: true,
    reconnectionAttempts: 3, // Réduire le nombre de tentatives
    reconnectionDelay: 2000, // Augmenter le délai entre les tentatives
    reconnectionDelayMax: 10000,
    timeout: 30000, // Augmenter le timeout
    forceNew: true, // Force une nouvelle connexion
    upgrade: false, // Désactiver l'upgrade vers WebSocket
    rememberUpgrade: false, // Ne pas se souvenir de l'upgrade
    path: "/socket.io/", // Chemin explicite pour Socket.IO
  });
};

/**
 * Types pour les événements Socket.IO côté client
 */
export interface ServerToClientEvents {
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
  "conversation:left": (data: { conversationId: string }) => void;
  error: (data: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  "message:send": (data: {
    conversationId: string;
    content: string;
    attachments?: any;
  }) => void;
  "message:read": (data: { messageId: string }) => void;
  "join:conversation": (data: { conversationId: string }) => void;
  "leave:conversation": (data: { conversationId: string }) => void;
}

export interface SocketData {
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
 * Configuration par défaut pour Socket.IO avec Vercel
 */
export const SOCKET_CONFIG = {
  transports: ["polling"] as const,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  forceNew: true,
} as const;
