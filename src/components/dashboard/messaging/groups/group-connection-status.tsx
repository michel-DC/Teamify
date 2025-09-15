"use client";

import { Users, Wifi, WifiOff, Loader2 } from "lucide-react";

interface GroupConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  memberCount?: number;
}

/**
 * Composant de statut de connexion pour les conversations de groupe
 */
export const GroupConnectionStatus = ({
  isConnected,
  isConnecting,
  memberCount = 0,
}: GroupConnectionStatusProps) => {
  if (isConnecting) {
    return (
      <div className="p-2 md:p-3 text-center text-xs md:text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
          <span>Connexion au groupe en cours...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-2 md:p-3 text-center text-xs md:text-sm text-destructive">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="h-3 w-3 md:h-4 md:w-4" />
          <span>Connexion perdue - Reconnexion en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-3 text-center text-xs md:text-sm text-green-600">
      <div className="flex items-center justify-center gap-2">
        <Wifi className="h-3 w-3 md:h-4 md:w-4" />
        <span>Connecté au groupe</span>
      </div>
    </div>
  );
};
