"use client";

import { useState, useEffect } from "react";
import { usePusher } from "@/hooks/usePusher";
import { useMessages } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Wifi, WifiOff } from "lucide-react";

export const TestMessagesComponent = () => {
  const [testMessage, setTestMessage] = useState("");
  const [conversationId, setConversationId] = useState("test-conversation");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const { messages, isLoading, addMessage } = useMessages({
    conversationId,
    autoFetch: true,
  });

  const { isConnected, connectToChannel, disconnect } = usePusher({
    onMessage: (message) => {
      addLog(`📨 Message reçu via Pusher: ${message.content}`);
      addMessage(message);
    },
    onError: (error) => {
      addLog(`❌ Erreur Pusher: ${error}`);
    },
  });

  useEffect(() => {
    if (isConnected) {
      connectToChannel(`conversation-${conversationId}`);
      addLog(`🔌 Connecté au canal conversation-${conversationId}`);
    }
  }, [isConnected, conversationId, connectToChannel]);

  const sendTestMessage = async () => {
    if (!testMessage.trim()) return;

    addLog(`📤 Envoi du message: ${testMessage}`);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          conversationId: conversationId,
          content: testMessage.trim(),
          senderId: "test-user", // Remplacez par un vrai UID d'utilisateur
        }),
      });

      if (response.ok) {
        addLog("✅ Message envoyé et sauvegardé en base");
        setTestMessage("");
      } else {
        const errorData = await response.json();
        addLog(`❌ Erreur envoi: ${response.status} - ${errorData.error}`);
      }
    } catch (error) {
      addLog(`❌ Erreur API: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Test Messages avec Pusher + Base de données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut */}
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connecté" : "Déconnecté"}
            </Badge>
            <Badge variant={isLoading ? "secondary" : "outline"}>
              {isLoading ? "Chargement..." : `${messages.length} messages`}
            </Badge>
          </div>

          {/* Configuration */}
          <div className="flex gap-2">
            <Input
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              placeholder="ID de conversation"
              className="flex-1"
            />
          </div>

          {/* Envoi de message */}
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

          {/* Messages */}
          <div>
            <h3 className="font-semibold mb-2">Messages ({messages.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className="p-2 bg-muted rounded text-sm">
                  <div className="font-medium">
                    {msg.sender?.firstname} {msg.sender?.lastname}
                  </div>
                  <div>{msg.content}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Logs</h3>
              <Button onClick={clearLogs} variant="outline" size="sm">
                Effacer
              </Button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto bg-muted p-3 rounded">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
