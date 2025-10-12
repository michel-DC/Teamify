"use client";

import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { usePusher } from "@/hooks/usePusher";
import { useAuth } from "@/hooks/useAuth";
import {
  ConversationSidebar,
  ConversationView,
  EmptyConversationState,
  UserConnectionStatus,
} from "@/components/dashboard/messaging";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";

/**
 * Page de messagerie entre utilisateurs
 */
export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const { checkAuth } = useAuth();
  const [user, setUser] = useState<any>(null);

  const { conversations } = useConversations({ autoFetch: true });

  // Hook Pusher pour la messagerie temps réel
  const { isConnected, isConnecting } = usePusher({
    onError: (error) => {
      console.error("Erreur Pusher:", error);
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

  /**
   * Gérer la sélection d'une conversation sur mobile
   */
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Sur mobile, masquer la sidebar après sélection
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  /**
   * Retourner à la liste des conversations sur mobile
   */
  const handleBackToConversations = () => {
    setSelectedConversationId(undefined);
    setShowSidebar(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header mobile - visible uniquement sur mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background">
        {selectedConversationId ? (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToConversations}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Messages</h1>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <h1 className="font-semibold">Messages</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar des conversations */}
        <div
          className={`
            ${showSidebar ? "flex" : "hidden"}
            md:flex
            w-full md:w-80
            border-r bg-background
            flex-col
            absolute md:relative
            z-20 md:z-auto
            h-full
          `}
        >
          <ConversationSidebar
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
            user={user}
            onCloseSidebar={() => setShowSidebar(false)}
          />
        </div>

        {/* Overlay mobile pour masquer la sidebar */}
        {showSidebar && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col w-full">
          {/* Indicateur de statut de connexion */}
          <UserConnectionStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            participantCount={selectedConversation?.members?.length || 0}
          />

          {selectedConversationId && selectedConversation ? (
            <ConversationView
              conversationId={selectedConversationId}
              conversation={selectedConversation}
              user={user}
              onBackToConversations={handleBackToConversations}
            />
          ) : (
            <EmptyConversationState
              onCreateConversation={() => setIsCreateDialogOpen(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
