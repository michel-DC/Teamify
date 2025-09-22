"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

/**
 * Composant de débogage pour diagnostiquer les problèmes Socket.IO
 */
export const SocketDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { isConnected, isConnecting, error } = useSocket();

  useEffect(() => {
    const info = {
      environment: process.env.NODE_ENV,
      hostname:
        typeof window !== "undefined" ? window.location.hostname : "server",
      port: typeof window !== "undefined" ? window.location.port : "server",
      socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "non défini",
      isProduction:
        process.env.NODE_ENV === "production" ||
        (typeof window !== "undefined" &&
          window.location.hostname !== "localhost"),
      isConnected,
      isConnecting,
      error,
      timestamp: new Date().toISOString(),
    };

    setDebugInfo(info);

    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Socket Debug Info:", info);
    }
  }, [isConnected, isConnecting, error]);

  // Ne pas afficher en production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">🔌 Socket.IO Debug</h4>
      <div className="space-y-1">
        <div>Env: {debugInfo.environment}</div>
        <div>Host: {debugInfo.hostname}</div>
        <div>Port: {debugInfo.port}</div>
        <div>Socket URL: {debugInfo.socketUrl}</div>
        <div>Production: {debugInfo.isProduction ? "✅" : "❌"}</div>
        <div>Connected: {debugInfo.isConnected ? "✅" : "❌"}</div>
        <div>Connecting: {debugInfo.isConnecting ? "🔄" : "⏸️"}</div>
        {debugInfo.error && (
          <div className="text-red-400">Error: {debugInfo.error}</div>
        )}
      </div>
    </div>
  );
};
