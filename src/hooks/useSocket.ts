"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { usePolling } from "./usePolling";

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
 * Hook pour gérer la connexion en temps réel via polling
 * Compatible avec Vercel et les API Routes Next.js
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

  // Utiliser le hook de polling en arrière-plan
  // currentUserId est optionnel car usePolling s'authentifie automatiquement
  const polling = usePolling({
    autoConnect,
    currentUserId, // Peut être undefined, usePolling gérera l'authentification
    onMessage,
    onMessageRead,
    onError,
    onConversationJoined,
    pollingInterval: 2000, // Polling toutes les 2 secondes
  });

  // Adapter l'interface pour maintenir la compatibilité
  return {
    socket: null, // Pas de socket réel avec le polling
    isConnected: polling.isConnected,
    isConnecting: polling.isConnecting,
    error: polling.error,
    connect: polling.connect,
    disconnect: polling.disconnect,
    sendMessage: polling.sendMessage,
    markMessageAsRead: polling.markMessageAsRead,
    joinConversation: polling.joinConversation,
    leaveConversation: polling.leaveConversation,
  };
};
