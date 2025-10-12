"use client";

import { useState, useEffect } from "react";
import { usePusherFixed } from "@/hooks/usePusherFixed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ConnectionDebugProps {
  conversationId?: string;
}

/**
 * Composant de debug pour diagnostiquer les problèmes de connexion Pusher
 */
export const ConnectionDebug = ({ conversationId }: ConnectionDebugProps) => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  const {
    isConnected,
    isConnecting,
    error,
    connectToChannel,
    disconnect,
    currentChannel,
  } = usePusherFixed({
    autoConnect: false,
    onError: (error) => {
      console.error("Pusher Error:", error);
    },
  });

  useEffect(() => {
    setDebugInfo({
      pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY ? "✅" : "❌",
      pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? "✅" : "❌",
      nodeEnv: process.env.NODE_ENV,
      isConnected,
      isConnecting,
      error,
      currentChannel,
      conversationId,
      timestamp: new Date().toISOString(),
    });
  }, [isConnected, isConnecting, error, currentChannel, conversationId]);

  const testConnection = () => {
    if (conversationId) {
      connectToChannel(`conversation-${conversationId}`);
    } else {
      connectToChannel("test-channel");
    }
  };

  const testDisconnect = () => {
    disconnect();
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>🔍 Debug Connexion Pusher</CardTitle>
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
          <div>
            Conversation ID:{" "}
            <Badge variant="outline">{conversationId || "None"}</Badge>
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
            <Button onClick={testConnection} disabled={isConnecting}>
              {isConnecting ? "Connexion..." : "Se connecter"}
            </Button>
            <Button
              onClick={testDisconnect}
              disabled={!isConnected}
              variant="outline"
            >
              Se déconnecter
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
