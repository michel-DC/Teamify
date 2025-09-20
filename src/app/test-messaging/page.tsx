import { MessagingDebug } from "@/components/dashboard/messaging/messaging-debug";

export default function TestMessagingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test du Système de Messagerie</h1>
      <MessagingDebug />
    </div>
  );
}
