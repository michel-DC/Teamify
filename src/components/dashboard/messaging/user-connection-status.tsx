"use client";

import { User, Wifi, WifiOff, Loader2 } from "lucide-react";

interface UserConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  participantCount?: number;
}

/**
 * Composant de statut de connexion pour les conversations entre utilisateurs
 */
export const UserConnectionStatus = ({
  isConnected,
  isConnecting,
  participantCount = 0,
}: UserConnectionStatusProps) => {
  if (isConnecting) {
    return (
      <div className="p-2 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connexion en cours...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-2 text-center text-sm text-destructive">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span>Connexion perdue - Reconnexion en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 text-center text-sm text-green-600">
      <div className="flex items-center justify-center gap-2">
        <Wifi className="h-4 w-4" />
        <span>Connecté</span>
        {participantCount > 0 && (
          <span className="text-muted-foreground">
            • {participantCount} participant{participantCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};
