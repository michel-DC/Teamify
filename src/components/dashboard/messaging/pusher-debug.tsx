"use client";

import { useState, useEffect } from "react";
import { usePusher } from "@/hooks/usePusher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

/**
 * Composant de debug pour diagnostiquer les problèmes Pusher
 */
export const PusherDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testChannel, setTestChannel] = useState("conversation-test-123");
  const [testMessage, setTestMessage] = useState("");

  const { isConnected, isConnecting, error, connectToChannel, currentChannel } =
    usePusher({
      autoConnect: false, // Désactiver la connexion automatique pour le debug
      onError: (error) => {
        console.error("Pusher Error:", error);
      },
    });

  useEffect(() => {
    // Collecter les informations de debug
    setDebugInfo({
      pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY ? "✅" : "❌",
      pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? "✅" : "❌",
      nodeEnv: process.env.NODE_ENV,
      isConnected,
      isConnecting,
      error,
      currentChannel,
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "SSR",
      timestamp: new Date().toISOString(),
    });
  }, [isConnected, isConnecting, error, currentChannel]);

  const testConnection = () => {
    connectToChannel(testChannel);
  };

  const testMessageSend = async () => {
    try {
      const response = await fetch("/api/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: testChannel,
          event: "new-message",
          data: {
            id: `test_${Date.now()}`,
            content: testMessage,
            senderId: "debug_user",
            senderName: "Debug User",
            conversationId: "test-123",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        console.log("✅ Message de test envoyé");
      } else {
        console.error("❌ Erreur envoi:", response.status);
      }
    } catch (error) {
      console.error("❌ Erreur API:", error);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>🔍 Debug Pusher - Production</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations de debug */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            Pusher Key:{" "}
            <Badge
              variant={debugInfo.pusherKey === "✅" ? "default" : "destructive"}
            >
              {debugInfo.pusherKey}
            </Badge>
          </div>
          <div>
            Pusher Cluster:{" "}
            <Badge
              variant={
                debugInfo.pusherCluster === "✅" ? "default" : "destructive"
              }
            >
              {debugInfo.pusherCluster}
            </Badge>
          </div>
          <div>
            Environment: <Badge>{debugInfo.nodeEnv}</Badge>
          </div>
          <div>
            Status:{" "}
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div>
            Current Channel:{" "}
            <Badge variant="outline">{currentChannel || "None"}</Badge>
          </div>
          {error && (
            <div className="col-span-2">
              Error: <Badge variant="destructive">{error}</Badge>
            </div>
          )}
        </div>

        {/* Test de connexion */}
        <div className="space-y-2">
          <h4 className="font-semibold">Test de Connexion</h4>
          <div className="flex gap-2">
            <Input
              value={testChannel}
              onChange={(e) => setTestChannel(e.target.value)}
              placeholder="Nom du canal"
              className="flex-1"
            />
            <Button onClick={testConnection} disabled={isConnecting}>
              {isConnecting ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
        </div>

        {/* Test d'envoi de message */}
        <div className="space-y-2">
          <h4 className="font-semibold">Test d'Envoi de Message</h4>
          <div className="flex gap-2">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Message de test"
              className="flex-1"
            />
            <Button
              onClick={testMessageSend}
              disabled={!isConnected || !testMessage.trim()}
            >
              Envoyer
            </Button>
          </div>
        </div>

        {/* Logs de debug */}
        <div className="space-y-2">
          <h4 className="font-semibold">Informations Détaillées</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
