"use client";

import { useState, useEffect } from "react";
import { useSocketSimple } from "@/hooks/useSocketSimple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wifi, WifiOff, MessageSquare, Send } from "lucide-react";

/**
 * Composant de test pour la messagerie simplifiée compatible Vercel
 */
export const SocketSimpleTest = () => {
  const [testMessage, setTestMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<{
    connection: boolean;
    messageSend: boolean;
    messageReceive: boolean;
  }>({
    connection: false,
    messageSend: false,
    messageReceive: false,
  });

  const {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    joinConversation,
    leaveConversation,
  } = useSocketSimple({
    currentUserId: "test_user",
    onMessage: (message) => {
      console.log("📨 Message reçu dans le test simple:", message);
      setReceivedMessages((prev) => [...prev, message]);
      setTestResults((prev) => ({ ...prev, messageReceive: true }));
    },
    onError: (error) => {
      console.error("❌ Erreur dans le test simple:", error);
    },
    onConversationJoined: (data) => {
      console.log("👥 Conversation rejointe dans le test simple:", data);
    },
  });

  // Mettre à jour le statut de connexion
  useEffect(() => {
    setTestResults((prev) => ({ ...prev, connection: isConnected }));
  }, [isConnected]);

  // Rejoindre une conversation de test au montage
  useEffect(() => {
    if (isConnected) {
      joinConversation("test_conversation_simple");
    }
  }, [isConnected, joinConversation]);

  const handleSendTestMessage = async () => {
    if (!testMessage.trim() || !isConnected) return;

    const success = await sendMessage({
      conversationId: "test_conversation_simple",
      content: testMessage.trim(),
    });

    if (success) {
      setTestMessage("");
      setTestResults((prev) => ({ ...prev, messageSend: true }));
    }
  };

  const handleTestAPI = async () => {
    try {
      const response = await fetch(
        "/api/socket-io-simple?action=connect&userId=test"
      );
      const data = await response.json();
      console.log("🔍 Test API simple:", data);
    } catch (error) {
      console.error("❌ Erreur lors du test API:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Test Messagerie Simple Vercel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut de connexion */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Statut de connexion:</span>
            {isConnecting ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Connexion...
              </Badge>
            ) : isConnected ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Connecté
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Déconnecté
              </Badge>
            )}
          </div>

          {/* Erreurs */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                <strong>Erreur:</strong> {error}
              </p>
            </div>
          )}

          {/* Test de l'API */}
          <div className="space-y-2">
            <h4 className="font-medium">Test API:</h4>
            <Button onClick={handleTestAPI} size="sm">
              Test API Simple
            </Button>
          </div>

          {/* Test d'envoi de message */}
          <div className="space-y-2">
            <h4 className="font-medium">Test d'envoi de message:</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Tapez un message de test..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                disabled={!isConnected}
              />
              <Button
                onClick={handleSendTestMessage}
                disabled={!isConnected || !testMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages reçus */}
          {receivedMessages.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">
                Messages reçus ({receivedMessages.length}):
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {receivedMessages.map((message, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <strong>
                      {message.sender?.firstname || "Utilisateur"}:
                    </strong>{" "}
                    {message.content}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Résultats des tests */}
          <div className="space-y-2">
            <h4 className="font-medium">Résultats des tests:</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={testResults.connection ? "default" : "secondary"}
                >
                  Connexion
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={testResults.messageSend ? "default" : "secondary"}
                >
                  Envoi
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={testResults.messageReceive ? "default" : "secondary"}
                >
                  Réception
                </Badge>
              </div>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <h4 className="font-medium">Informations techniques:</h4>
            <div>• Transport: HTTP Polling (toutes les 2s)</div>
            <div>• API: /api/socket-io-simple</div>
            <div>• Compatible Vercel: ✅</div>
            <div>• Pas de WebSockets</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
