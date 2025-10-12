"use client";

import { useState, useEffect } from "react";
import { usePusherFixed } from "@/hooks/usePusherFixed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Bug, ChevronUp, ChevronDown } from "lucide-react";

interface ConnectionDebugProps {
  conversationId?: string;
}

/**
 * Composant de debug flottant pour diagnostiquer les problèmes de connexion Pusher
 */
export const ConnectionDebug = ({ conversationId }: ConnectionDebugProps) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="rounded-full shadow-lg"
          variant={isConnected ? "default" : "destructive"}
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug Pusher
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Pusher
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                {isMinimized ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-3 pt-0">
            {/* Informations de debug compactes */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge
                  variant={isConnected ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Channel:</span>
                <Badge variant="outline" className="text-xs">
                  {currentChannel || "None"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Conversation:</span>
                <Badge variant="outline" className="text-xs">
                  {conversationId || "None"}
                </Badge>
              </div>
              {error && (
                <div className="text-red-500 text-xs">Error: {error}</div>
              )}
            </div>

            {/* Test de connexion compact */}
            <div className="space-y-2">
              <div className="flex gap-1">
                <Button
                  onClick={testConnection}
                  disabled={isConnecting}
                  size="sm"
                  className="flex-1 text-xs"
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
                <Button
                  onClick={testDisconnect}
                  disabled={!isConnected}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Disconnect
                </Button>
              </div>
            </div>

            {/* Informations détaillées (collapsible) */}
            <details className="text-xs">
              <summary className="cursor-pointer font-medium">Details</summary>
              <div className="mt-2 space-y-1">
                <div>Pusher Key: {debugInfo.pusherKey}</div>
                <div>Pusher Cluster: {debugInfo.pusherCluster}</div>
                <div>Environment: {debugInfo.nodeEnv}</div>
                <div>
                  Timestamp:{" "}
                  {new Date(debugInfo.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </details>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
