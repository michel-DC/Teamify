"use client";

import { useState, useEffect } from "react";
import { usePusher } from "@/hooks/usePusher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Wifi, WifiOff } from "lucide-react";

/**
 * Composant de test pour vérifier l'intégration Pusher
 */
export const PusherTest = () => {
  const [testMessage, setTestMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const { isConnected, isConnecting, error, connectToChannel, disconnect } =
    usePusher({
      onMessage: (message) => {
        setReceivedMessages((prev) => [...prev, message]);
        setTestResults((prev) => [
          ...prev,
          `✅ Message reçu: ${message.content}`,
        ]);
      },
      onError: (error) => {
        setTestResults((prev) => [
          ...prev,
          `❌ Erreur: ${error.message || error}`,
        ]);
      },
    });

  /**
   * Envoyer un message de test
   */
  const sendTestMessage = async () => {
    if (!testMessage.trim()) return;

    try {
      const response = await fetch("/api/trigger-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "chat-channel",
          event: "new-message",
          data: {
            id: `test_${Date.now()}`,
            content: testMessage.trim(),
            senderId: "test_user",
            senderName: "Test User",
            conversationId: "test_conversation",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        setTestResults((prev) => [
          ...prev,
          `📤 Message envoyé: ${testMessage}`,
        ]);
        setTestMessage("");
      } else {
        setTestResults((prev) => [
          ...prev,
          `❌ Erreur envoi: ${response.status}`,
        ]);
      }
    } catch (error) {
      setTestResults((prev) => [...prev, `❌ Erreur API: ${error}`]);
    }
  };

  /**
   * Se connecter au canal de test
   */
  const connectToTestChannel = () => {
    connectToChannel("chat-channel");
    setTestResults((prev) => [...prev, "🔌 Connexion au canal chat-channel"]);
  };

  /**
   * Se déconnecter
   */
  const disconnectFromChannel = () => {
    disconnect();
    setTestResults((prev) => [...prev, "🔌 Déconnexion du canal"]);
  };

  /**
   * Effacer les résultats
   */
  const clearResults = () => {
    setTestResults([]);
    setReceivedMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Test d'intégration Pusher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut de connexion */}
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnecting
                ? "Connexion..."
                : isConnected
                ? "Connecté"
                : "Déconnecté"}
            </Badge>
            {error && <Badge variant="destructive">Erreur: {error}</Badge>}
          </div>

          {/* Contrôles de connexion */}
          <div className="flex gap-2">
            <Button onClick={connectToTestChannel} disabled={isConnected}>
              Se connecter au canal
            </Button>
            <Button
              onClick={disconnectFromChannel}
              disabled={!isConnected}
              variant="outline"
            >
              Se déconnecter
            </Button>
            <Button onClick={clearResults} variant="outline">
              Effacer les résultats
            </Button>
          </div>

          {/* Envoi de message de test */}
          <div className="flex gap-2">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Message de test..."
              disabled={!isConnected}
            />
            <Button
              onClick={sendTestMessage}
              disabled={!isConnected || !testMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages reçus */}
          {receivedMessages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">
                Messages reçus ({receivedMessages.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {receivedMessages.map((msg, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    <strong>{msg.senderName}:</strong> {msg.content}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journal des résultats */}
          <div>
            <h3 className="font-semibold mb-2">Journal des tests</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
