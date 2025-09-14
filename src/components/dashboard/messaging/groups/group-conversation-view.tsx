"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useMessages } from "@/hooks/useMessages";
import { useAutoSignedImage } from "@/hooks/useAutoSignedImage";
import { MessageList } from "../message-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreVertical, Send, X, Users } from "lucide-react";
import { GroupMembersList } from "./group-members-list";
import { WelcomeMessage } from "./welcome-message";

interface GroupConversationViewProps {
  conversationId: string;
  conversation: any;
  user: any;
  onBackToConversations?: () => void;
}

/**
 * Vue d'une conversation de groupe responsive avec zone de messages et saisie
 */
export const GroupConversationView = ({
  conversationId,
  conversation,
  user,
  onBackToConversations,
}: GroupConversationViewProps) => {
  const [newMessage, setNewMessage] = useState("");

  // Hook pour gérer les messages de la conversation
  const {
    messages,
    isLoading: messagesLoading,
    addMessage,
    deleteMessage,
  } = useMessages({
    conversationId,
    autoFetch: true,
  });

  const {
    isConnected,
    sendMessage,
    isConnecting,
    error: socketError,
    joinConversation,
    leaveConversation,
  } = useSocket({
    currentUserId: user?.uid,
    onMessage: (message) => {
      addMessage(message);
    },
    onError: (error) => {
      console.error("❌ Erreur Socket.IO dans GroupConversationView:", error);
    },
  });

  // Rejoindre la conversation quand elle change
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId && isConnected) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  /**
   * Obtenir le nom d'affichage d'une conversation de groupe
   */
  const getConversationDisplayName = (conversation: any) => {
    if (conversation.title) return conversation.title;
    return "Groupe de discussion";
  };

  /**
   * Obtenir l'avatar d'une conversation de groupe
   */
  const getConversationAvatar = (conversation: any) => {
    // Pour les conversations de groupe, utiliser l'avatar de l'organisation
    return conversation.organization?.profileImage || null;
  };

  /**
   * Obtenir les initiales d'une conversation de groupe
   */
  const getConversationInitials = (conversation: any) => {
    if (conversation.title) {
      return conversation.title.charAt(0).toUpperCase();
    }
    // Utiliser les initiales de l'organisation
    if (conversation.organization?.name) {
      return conversation.organization.name.charAt(0).toUpperCase();
    }
    return "G";
  };

  /**
   * Obtenir le nombre de membres dans la conversation
   */
  const getMemberCount = (conversation: any) => {
    return conversation.members?.length || 0;
  };

  /**
   * Envoyer un message
   */
  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      return;
    }

    if (!isConnected) {
      return;
    }

    const success = sendMessage({
      conversationId,
      content: newMessage.trim(),
    });

    if (success) {
      setNewMessage("");
    }
  };

  /**
   * Composant pour l'avatar de la conversation avec URL signée
   */
  const ConversationAvatar = () => {
    const { signedUrl } = useAutoSignedImage(
      getConversationAvatar(conversation)
    );

    return (
      <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
        <AvatarImage src={signedUrl || undefined} />
        <AvatarFallback>{getConversationInitials(conversation)}</AvatarFallback>
      </Avatar>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Message de bienvenue automatique */}
      <WelcomeMessage conversationId={conversationId} />

      {/* En-tête de la conversation - Responsive */}
      <div className="p-3 md:p-4 border-b bg-background flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Bouton retour sur mobile */}
            {onBackToConversations && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToConversations}
                className="md:hidden flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <ConversationAvatar />

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-sm md:text-base truncate">
                {getConversationDisplayName(conversation)}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GroupMembersList
                  members={conversation.members || []}
                  currentUserId={user?.uid}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onBackToConversations}>
                  <X className="h-4 w-4 mr-2" />
                  Fermer la conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Zone des messages - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList
          messages={messages}
          currentUserId={user?.uid}
          isLoading={messagesLoading}
          onDeleteMessage={deleteMessage}
        />
      </div>

      {/* Zone de saisie - Responsive */}
      <div className="p-3 md:p-4 border-t bg-background flex-shrink-0">
        <div className="flex items-end gap-2 w-full">
          <div className="relative flex-1">
            <Input
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              disabled={!isConnected}
              className="flex-1 min-h-[40px] max-h-32 w-full resize-none pr-10"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-primary disabled:opacity-50"
              tabIndex={-1}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
