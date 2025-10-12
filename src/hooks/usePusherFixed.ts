import { useEffect, useRef, useState, useCallback } from "react";
import { getPusherClient } from "@/lib/pusher";
import type { Channel } from "pusher-js";

/**
 * Types pour les événements Pusher
 */
export interface PusherMessageEvent {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  conversationId: string;
  timestamp: string;
}

export interface PusherMessageReadEvent {
  messageId: string;
  userId: string;
  conversationId: string;
  timestamp: string;
}

export interface PusherConversationJoinedEvent {
  conversationId: string;
  userId: string;
  timestamp: string;
}

/**
 * Options pour le hook usePusher
 */
export interface UsePusherOptions {
  autoConnect?: boolean;
  onMessage?: (data: PusherMessageEvent) => void;
  onMessageRead?: (data: PusherMessageReadEvent) => void;
  onConversationJoined?: (data: PusherConversationJoinedEvent) => void;
  onError?: (error: any) => void;
}

/**
 * Hook corrigé pour gérer la connexion Pusher
 * Problème résolu : Gestion correcte de l'état de connexion
 */
export const usePusherFixed = (options: UsePusherOptions = {}) => {
  const {
    autoConnect = false, // Changé de true à false par défaut
    onMessage,
    onMessageRead,
    onConversationJoined,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChannelName, setCurrentChannelName] = useState<string | null>(
    null
  );

  const channelRef = useRef<Channel | null>(null);
  const pusherClientRef = useRef<any>(null);
  const onMessageRef = useRef(onMessage);
  const onMessageReadRef = useRef(onMessageRead);
  const onConversationJoinedRef = useRef(onConversationJoined);
  const onErrorRef = useRef(onError);

  // Mise à jour des refs
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onMessageReadRef.current = onMessageRead;
  }, [onMessageRead]);

  useEffect(() => {
    onConversationJoinedRef.current = onConversationJoined;
  }, [onConversationJoined]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /**
   * Initialiser le client Pusher
   */
  const initializePusherClient = useCallback(() => {
    if (!pusherClientRef.current) {
      try {
        const client = getPusherClient();
        pusherClientRef.current = client;

        // Écouter les événements de connexion globale
        client.connection.bind("connected", () => {
          console.log("✅ Pusher client connecté");
        });

        client.connection.bind("disconnected", () => {
          console.log("⚠️ Pusher client déconnecté");
          setIsConnected(false);
          setIsConnecting(false);
        });

        client.connection.bind("error", (error: any) => {
          console.error("❌ Erreur de connexion Pusher:", error);
          setError(`Erreur de connexion: ${error.message || error}`);
          setIsConnected(false);
          setIsConnecting(false);
          onErrorRef.current?.(error);
        });

        return client;
      } catch (error) {
        console.error("❌ Erreur d'initialisation Pusher:", error);
        setError("Erreur d'initialisation Pusher");
        onErrorRef.current?.(error);
        return null;
      }
    }
    return pusherClientRef.current;
  }, []);

  /**
   * Se connecter à un canal Pusher
   */
  const connectToChannel = useCallback(
    (channelName: string) => {
      console.log(`🔌 Tentative de connexion au canal: ${channelName}`);

      // Initialiser le client si nécessaire
      const client = initializePusherClient();
      if (!client) {
        setError("Impossible d'initialiser le client Pusher");
        return;
      }

      // Se déconnecter du canal précédent si nécessaire
      if (channelRef.current) {
        console.log(
          `🔌 Déconnexion du canal précédent: ${channelRef.current.name}`
        );
        channelRef.current.unbind_all();
        client.unsubscribe(channelRef.current.name);
      }

      setIsConnecting(true);
      setError(null);

      try {
        const channel = client.subscribe(channelName);
        channelRef.current = channel;
        setCurrentChannelName(channelName);

        // Écouter les événements de connexion du canal
        channel.bind("pusher:subscription_succeeded", () => {
          console.log(`✅ Connecté au canal Pusher: ${channelName}`);
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
        });

        channel.bind("pusher:subscription_error", (error: any) => {
          console.error(
            `❌ Erreur de souscription au canal ${channelName}:`,
            error
          );
          setError(error.message || "Erreur de connexion au canal");
          setIsConnecting(false);
          setIsConnected(false);
          onErrorRef.current?.(error);
        });

        // Écouter les événements personnalisés
        channel.bind("new-message", (data: PusherMessageEvent) => {
          console.log("📨 Message reçu via Pusher:", data);
          // Transformer le message Pusher au format attendu par le composant
          const transformedMessage = {
            id: data.id,
            content: data.content,
            senderId: data.senderId,
            conversationId: data.conversationId,
            createdAt: new Date(data.timestamp),
            sender: {
              uid: data.senderId,
              firstname: data.senderName.split(" ")[0] || "",
              lastname: data.senderName.split(" ").slice(1).join(" ") || "",
              profileImage: data.senderImage || null,
            },
          };
          onMessageRef.current?.(transformedMessage);
        });

        channel.bind("message-read", (data: PusherMessageReadEvent) => {
          onMessageReadRef.current?.(data);
        });

        channel.bind(
          "conversation-joined",
          (data: PusherConversationJoinedEvent) => {
            onConversationJoinedRef.current?.(data);
          }
        );
      } catch (error) {
        console.error("❌ Erreur lors de la connexion au canal:", error);
        setError("Erreur lors de l'initialisation de la connexion Pusher");
        setIsConnecting(false);
        onErrorRef.current?.(error);
      }
    },
    [initializePusherClient]
  );

  /**
   * Se déconnecter du canal
   */
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      console.log(`🔌 Déconnexion du canal: ${channelRef.current.name}`);
      channelRef.current.unbind_all();
      try {
        const client = pusherClientRef.current;
        if (client) {
          client.unsubscribe(channelRef.current.name);
        }
      } catch (error) {
        console.warn("Erreur lors de la déconnexion Pusher:", error);
      }
      channelRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setCurrentChannelName(null);
  }, []);

  /**
   * Se connecter automatiquement si activé
   */
  useEffect(() => {
    if (autoConnect) {
      // Se connecter au canal général par défaut
      connectToChannel("chat-channel");
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connectToChannel, disconnect]);

  /**
   * Nettoyage à la déconnexion
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connectToChannel,
    disconnect,
    currentChannel: currentChannelName,
  };
};
