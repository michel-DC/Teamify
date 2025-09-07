import { SocketIODemo } from "@/components/messaging/SocketIODemo";

/**
 * Page de démonstration du système Socket.IO
 */
export default function MessagingPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messagerie Temps Réel</h1>
        <p className="text-muted-foreground mt-2">
          Démonstration du système Socket.IO intégré dans Teamify
        </p>
      </div>

      <SocketIODemo />
    </div>
  );
}
