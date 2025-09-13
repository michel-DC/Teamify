"use client";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
}

/**
 * Indicateur de statut de connexion Socket.IO
 */
export const ConnectionStatus = ({
  isConnected,
  isConnecting,
}: ConnectionStatusProps) => {
  return (
    <div className="p-4 border-t">
      <div className="flex items-center gap-2 text-sm">
        <div
          className={`h-2 w-2 rounded-full ${
            isConnected
              ? "bg-green-500"
              : isConnecting
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        />
        <span className="text-muted-foreground">
          {isConnected
            ? "Connecté"
            : isConnecting
            ? "Connexion..."
            : "Déconnecté"}
        </span>
      </div>
    </div>
  );
};
