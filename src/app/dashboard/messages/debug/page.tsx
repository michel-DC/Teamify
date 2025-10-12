"use client";

import { useState } from "react";
import { PusherDebug } from "@/components/dashboard/messaging/pusher-debug";
import { ChatInterfaceFixed } from "@/components/dashboard/messaging/chat-interface-fixed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Page de debug pour diagnostiquer les problèmes Pusher en production
 */
export default function MessagesDebugPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();
  const [showFixedInterface, setShowFixedInterface] = useState(false);

  // Conversations de test
  const testConversations = [
    {
      id: "test-conversation-1",
      type: "PRIVATE" as const,
      title: "Test Conversation 1",
      members: [
        {
          id: "member-1",
          userId: "user-1",
          role: "MEMBER" as const,
          user: {
            uid: "user-1",
            firstname: "Test",
            lastname: "User",
            profileImage: null,
          },
        },
      ],
      unreadCount: 0,
    },
    {
      id: "test-conversation-2",
      type: "GROUP" as const,
      title: "Test Group",
      members: [
        {
          id: "member-2",
          userId: "user-2",
          role: "ADMIN" as const,
          user: {
            uid: "user-2",
            firstname: "Admin",
            lastname: "User",
            profileImage: null,
          },
        },
      ],
      unreadCount: 0,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Debug Pusher - Production</h1>
          <p className="text-muted-foreground">
            Diagnostic des problèmes de messagerie en production
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFixedInterface(!showFixedInterface)}
            variant={showFixedInterface ? "default" : "outline"}
          >
            {showFixedInterface ? "Masquer" : "Afficher"} Interface Corrigée
          </Button>
        </div>
      </div>

      {/* Debug Pusher */}
      <PusherDebug />

      {/* Interface de test */}
      {showFixedInterface && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Interface de Test Corrigée
              <Badge variant="outline">Version Fixée</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    setSelectedConversationId("test-conversation-1")
                  }
                  variant={
                    selectedConversationId === "test-conversation-1"
                      ? "default"
                      : "outline"
                  }
                >
                  Conversation 1
                </Button>
                <Button
                  onClick={() =>
                    setSelectedConversationId("test-conversation-2")
                  }
                  variant={
                    selectedConversationId === "test-conversation-2"
                      ? "default"
                      : "outline"
                  }
                >
                  Conversation 2
                </Button>
                <Button
                  onClick={() => setSelectedConversationId(undefined)}
                  variant="outline"
                >
                  Aucune
                </Button>
              </div>

              <ChatInterfaceFixed
                conversations={testConversations}
                onConversationSelect={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions de Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>1. Vérifiez les variables d'environnement :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>NEXT_PUBLIC_PUSHER_KEY doit être défini</li>
              <li>NEXT_PUBLIC_PUSHER_CLUSTER doit être défini</li>
              <li>
                PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER côté
                serveur
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <strong>2. Testez la connexion :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Utilisez le composant de debug ci-dessus</li>
              <li>Vérifiez que le statut passe à "Connected"</li>
              <li>Testez l'envoi de messages</li>
            </ul>
          </div>
          <div className="text-sm">
            <strong>3. Problèmes courants :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Variables d'environnement manquantes ou incorrectes</li>
              <li>Connexion au mauvais canal</li>
              <li>État de connexion non synchronisé</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
