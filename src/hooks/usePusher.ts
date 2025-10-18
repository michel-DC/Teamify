import { useEffect, useRef, useState, useCallback } from "react";
import { getPusherClient } from "@/lib/pusher";
import type { Channel } from "pusher-js";

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

export interface UsePusherOptions {
  autoConnect?: boolean;
  onMessage?: (data: PusherMessageEvent) => void;
  onMessageRead?: (data: PusherMessageReadEvent) => void;
  onConversationJoined?: (data: PusherConversationJoinedEvent) => void;
  onError?: (error: any) => void;
}

export const usePusher = (options: UsePusherOptions = {}) => {
  const {
    autoConnect = true,
    onMessage,
    onMessageRead,
    onConversationJoined,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<Channel | null>(null);
  const onMessageRef = useRef(onMessage);
  const onMessageReadRef = useRef(onMessageRead);
  const onConversationJoinedRef = useRef(onConversationJoined);
  const onErrorRef = useRef(onError);

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

  const connectToChannel = useCallback((channelName: string) => {
    if (channelRef.current) {
      channelRef.current.unbind_all();
      const client = getPusherClient();
      client.unsubscribe(channelRef.current.name);
    }

    setIsConnecting(true);
    setError(null);

    try {
      const client = getPusherClient();
      const channel = client.subscribe(channelName);
      channelRef.current = channel;

      channel.bind("pusher:subscription_succeeded", () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        console.log(`✅ Connecté au canal Pusher: ${channelName}`);
      });

      channel.bind("pusher:subscription_error", (error: any) => {
        setError(error.message || "Erreur de connexion au canal");
        setIsConnecting(false);
        setIsConnected(false);
        onErrorRef.current?.(error);
      });

      channel.bind("new-message", (data: PusherMessageEvent) => {
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
      setError("Erreur lors de l'initialisation de la connexion Pusher");
      setIsConnecting(false);
      onErrorRef.current?.(error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unbind_all();
      try {
        const client = getPusherClient();
        client.unsubscribe(channelRef.current.name);
      } catch (error) {
        console.warn("Erreur lors de la déconnexion Pusher:", error);
      }
      channelRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connectToChannel("chat-channel");
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connectToChannel, disconnect]);

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
    currentChannel: channelRef.current?.name || null,
  };
};
