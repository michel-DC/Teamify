"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  MessageSquare,
} from "lucide-react";

/**
 * Composant de débogage pour tester le système de messagerie
 */
export const MessagingDebug = () => {
  const [testMessage, setTestMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const { isConnected, isConnecting, error, sendMessage } = useSocket({
    // currentUserId sera récupéré automatiquement via l'authentification
    onMessage: (message) => {
      console.log("🎯 [MessagingDebug] Message received:", message);
      setMessages((prev) => [...prev, { ...message, receivedAt: new Date() }]);
    },
    onError: (error) => {
      console.log("❌ [MessagingDebug] Error received:", error);
    },
  });

  // Créer ou récupérer la conversation de test au montage
  useEffect(() => {
    const createOrGetTestConversation = async () => {
      setIsCreatingConversation(true);
      try {
        // D'abord essayer de récupérer une conversation existante
        let response = await fetch("/api/test-conversation", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          // Si pas trouvée, en créer une nouvelle
          response = await fetch("/api/test-conversation", {
            method: "POST",
            credentials: "include",
          });
        }

        if (response.ok) {
          const data = await response.json();
          setConversationId(data.id);
          console.log("✅ [MessagingDebug] Test conversation ready:", data.id);
        } else {
          console.error(
            "❌ [MessagingDebug] Failed to create/get test conversation"
          );
        }
      } catch (error) {
        console.error(
          "❌ [MessagingDebug] Error creating test conversation:",
          error
        );
      } finally {
        setIsCreatingConversation(false);
      }
    };

    createOrGetTestConversation();
  }, []);

  const handleSendMessage = async () => {
    if (!testMessage.trim() || !conversationId) return;

    setIsSending(true);
    console.log("🚀 [MessagingDebug] Sending message:", testMessage);

    try {
      const result = await sendMessage({
        conversationId: conversationId,
        content: testMessage,
      });

      console.log("📤 [MessagingDebug] Send result:", result);

      if (result) {
        setTestMessage("");
      }
    } catch (error) {
      console.error("❌ [MessagingDebug] Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messaging Debug
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected
              ? "Connecté"
              : isConnecting
              ? "Connexion..."
              : "Déconnecté"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              État de connexion
            </div>
            <div className="text-sm text-blue-600">
              {isConnected
                ? "✅ Connecté"
                : isConnecting
                ? "🔄 Connexion..."
                : "❌ Déconnecté"}
            </div>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-800">
              Messages reçus
            </div>
            <div className="text-sm text-green-600">{messages.length}</div>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm font-medium text-purple-800">
              Conversation de test
            </div>
            <div className="text-sm text-purple-600">
              {isCreatingConversation
                ? "🔄 Création..."
                : conversationId
                ? "✅ Prête"
                : "❌ Non créée"}
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Erreur</span>
            </div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        )}

        {/* Message input */}
        <div className="flex gap-2">
          <Input
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Tapez votre message de test..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !testMessage.trim() || !conversationId}
            className="flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSending ? "Envoi..." : "Envoyer"}
          </Button>
        </div>

        {/* Messages list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Messages reçus ({messages.length})</h4>
            <Button onClick={clearMessages} variant="outline" size="sm">
              Effacer
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Aucun message reçu
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {message.sender?.firstname || "Unknown"}{" "}
                        {message.sender?.lastname || ""}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {message.id} | Reçu:{" "}
                        {message.receivedAt?.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleTimeString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Debug info */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm font-medium text-gray-800 mb-2">
            Debug Info
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Environment: {process.env.NODE_ENV}</div>
            <div>Connected: {isConnected ? "Yes" : "No"}</div>
            <div>Connecting: {isConnecting ? "Yes" : "No"}</div>
            <div>Error: {error || "None"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
