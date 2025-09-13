"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useConversations } from "@/hooks/useConversations";
import { ChatInterface } from "./ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wifi,
  WifiOff,
  MessageCircle,
  Users,
  Activity,
  Clock,
} from "lucide-react";

/**
 * Composant de démonstration du système Socket.IO
 */
export const SocketIODemo = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();
  const [connectionStats, setConnectionStats] = useState({
    connectTime: 0,
    messageCount: 0,
    lastMessageTime: null as Date | null,
  });

  // Hook Socket.IO
  const {
    isConnected,
    isConnecting,
    error: socketError,
    sendMessage,
    markMessageAsRead,
  } = useSocket({
    onMessage: (message) => {
      setConnectionStats((prev) => ({
        ...prev,
        messageCount: prev.messageCount + 1,
        lastMessageTime: new Date(),
      }));
    },
    onError: (error) => {
      console.error("Erreur Socket.IO:", error);
    },
  });

  // Hook conversations
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    createConversation,
  } = useConversations();

  /**
   * Créer une conversation de test
   */
  const createTestConversation = async () => {
    try {
      const newConversation = await createConversation({
        type: "GROUP",
        title: "Conversation de test Socket.IO",
        memberIds: [], // L'utilisateur actuel sera ajouté automatiquement
      });

      if (newConversation) {
        setSelectedConversationId(newConversation.id);
      }
    } catch (error) {
      console.error("Erreur création conversation:", error);
    }
  };

  /**
   * Envoyer un message de test
   */
  const sendTestMessage = () => {
    if (selectedConversationId && isConnected) {
      const success = sendMessage({
        conversationId: selectedConversationId,
        content: `Message de test envoyé à ${new Date().toLocaleTimeString()}`,
      });
    }
  };

  /**
   * Mesurer le temps de connexion
   */
  useEffect(() => {
    if (isConnected && connectionStats.connectTime === 0) {
      setConnectionStats((prev) => ({
        ...prev,
        connectTime: Date.now(),
      }));
    }
  }, [isConnected, connectionStats.connectTime]);

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Démonstration Socket.IO - Messagerie Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Statut de connexion */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : isConnecting ? (
                <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {isConnected
                  ? "Connecté"
                  : isConnecting
                  ? "Connexion..."
                  : "Déconnecté"}
              </span>
            </div>

            {/* Nombre de conversations */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                {conversations.length} conversation(s)
              </span>
            </div>

            {/* Messages reçus */}
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-purple-500" />
              <span className="text-sm">
                {connectionStats.messageCount} message(s)
              </span>
            </div>

            {/* Dernier message */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {connectionStats.lastMessageTime
                  ? connectionStats.lastMessageTime.toLocaleTimeString()
                  : "Aucun"}
              </span>
            </div>
          </div>

          {/* Erreurs */}
          {(socketError || conversationsError) && (
            <div className="mt-4 space-y-2">
              {socketError && (
                <Badge variant="destructive">Socket.IO: {socketError}</Badge>
              )}
              {conversationsError && (
                <Badge variant="destructive">
                  Conversations: {conversationsError}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions de test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={createTestConversation}
              disabled={conversationsLoading}
              variant="outline"
            >
              Créer Conversation Test
            </Button>

            <Button
              onClick={sendTestMessage}
              disabled={!isConnected || !selectedConversationId}
              variant="outline"
            >
              Envoyer Message Test
            </Button>

            <Button
              onClick={() => setSelectedConversationId(undefined)}
              variant="outline"
            >
              Désélectionner
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Interface de messagerie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interface de Messagerie</CardTitle>
        </CardHeader>
        <CardContent>
          {conversationsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Activity className="h-8 w-8 animate-pulse mx-auto mb-2" />
                <p>Chargement des conversations...</p>
              </div>
            </div>
          ) : (
            <ChatInterface
              conversations={conversations}
              onConversationSelect={setSelectedConversationId}
              selectedConversationId={selectedConversationId}
            />
          )}
        </CardContent>
      </Card>

      {/* Informations techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations Techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Serveur Socket.IO:</strong>{" "}
              {process.env.NODE_ENV === "production"
                ? process.env.NEXT_PUBLIC_SOCKET_URL || "Production:3001"
                : "http://localhost:3001"}
            </p>
            <p>
              <strong>Transport:</strong> WebSocket + Polling
            </p>
            <p>
              <strong>Authentification:</strong> JWT via cookies
            </p>
            <p>
              <strong>Événements:</strong> message:send, message:new,
              message:read
            </p>
            <p>
              <strong>Rooms:</strong> user:{`{uid}`}, conversation:{`{id}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
