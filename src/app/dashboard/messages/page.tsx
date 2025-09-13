"use client";

import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ConversationSidebar } from "@/components/messaging/ConversationSidebar";
import { ConversationView } from "@/components/messaging/ConversationView";
import { EmptyConversationState } from "@/components/messaging/EmptyConversationState";
import { ConnectionStatus } from "@/components/messaging/ConnectionStatus";

/**
 * Page de messagerie entre utilisateurs
 */
export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { checkAuth } = useAuth();
  const [user, setUser] = useState<any>(null);

  const { conversations } = useConversations({ autoFetch: true });

  // Hook Socket.IO pour la messagerie temps réel
  const { isConnected, isConnecting } = useSocket({
    onMessage: (message) => {
      console.log("Nouveau message reçu:", message);
    },
    onError: (error) => {
      console.error("Erreur Socket.IO:", error);
    },
  });

  /**
   * Vérification de l'authentification au montage
   */
  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth();
      if (authResult.isAuthenticated) {
        setUser(authResult.user);
      }
    };

    verifyAuth();
  }, [checkAuth]);

  /**
   * Obtenir la conversation sélectionnée
   */
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header avec navigation */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Tableau de bord
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Messages</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex flex-1">
        {/* Sidebar des conversations */}
        <div className="w-80 border-r bg-background flex flex-col">
          <ConversationSidebar
            selectedConversationId={selectedConversationId}
            onConversationSelect={setSelectedConversationId}
            user={user}
          />

          {/* Statut de connexion */}
          <ConnectionStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
          />
        </div>

        {/* Zone de conversation */}
        {selectedConversationId && selectedConversation ? (
          <ConversationView
            conversationId={selectedConversationId}
            conversation={selectedConversation}
            user={user}
          />
        ) : (
          <EmptyConversationState
            onCreateConversation={() => setIsCreateDialogOpen(true)}
          />
        )}
      </div>
    </div>
  );
}
