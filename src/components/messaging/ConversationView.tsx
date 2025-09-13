"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useMessages } from "@/hooks/useMessages";
import { MessageList } from "./MessageList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Info,
  Send,
} from "lucide-react";

interface ConversationViewProps {
  conversationId: string;
  conversation: any;
  user: any;
}

/**
 * Vue d'une conversation avec zone de messages et saisie
 */
export const ConversationView = ({
  conversationId,
  conversation,
  user,
}: ConversationViewProps) => {
  const [newMessage, setNewMessage] = useState("");

  // Hook pour gérer les messages de la conversation
  const {
    messages,
    isLoading: messagesLoading,
    addMessage,
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
    currentUserId: user?.uid, // Passer l'ID utilisateur pour les messages optimistes
    onMessage: (message) => {
      // Ajouter le message à la liste
      addMessage(message);
    },
    onError: (error) => {
      console.error("❌ Erreur Socket.IO dans ConversationView:", error);
    },
  });

  // Rejoindre la conversation quand elle change
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
    }

    // Nettoyage : quitter la conversation précédente
    return () => {
      if (conversationId && isConnected) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  /**
   * Obtenir le nom d'affichage d'une conversation
   */
  const getConversationDisplayName = (conversation: any) => {
    if (conversation.title) return conversation.title;

    // Pour les conversations privées, afficher le nom de l'autre utilisateur
    if (conversation.type === "PRIVATE") {
      const otherMember = conversation.members.find(
        (member: any) => member.user.uid !== user?.uid
      );
      if (otherMember) {
        return (
          `${otherMember.user.firstname || ""} ${
            otherMember.user.lastname || ""
          }`.trim() || "Utilisateur"
        );
      }
    }

    return "Conversation";
  };

  /**
   * Obtenir l'avatar d'une conversation
   */
  const getConversationAvatar = (conversation: any) => {
    if (conversation.type === "PRIVATE") {
      const otherMember = conversation.members.find(
        (member: any) => member.user.uid !== user?.uid
      );
      if (otherMember) {
        return otherMember.user.profileImage;
      }
    }

    return null;
  };

  /**
   * Obtenir les initiales d'une conversation
   */
  const getConversationInitials = (conversation: any) => {
    if (conversation.type === "PRIVATE") {
      const otherMember = conversation.members.find(
        (member: any) => member.user.uid !== user?.uid
      );
      if (otherMember) {
        const firstname = otherMember.user.firstname || "";
        const lastname = otherMember.user.lastname || "";
        return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
      }
    }

    return "C";
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

  return (
    <div className="flex-1 flex flex-col">
      {/* En-tête de la conversation */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getConversationAvatar(conversation)} />
              <AvatarFallback>
                {getConversationInitials(conversation)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">
                {getConversationDisplayName(conversation)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {conversation.members.length} membre(s)
                {socketError && (
                  <span className="text-red-500 ml-2">
                    • Erreur: {socketError}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Info className="h-4 w-4 mr-2" />
                  Détails
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Zone des messages */}
      <MessageList
        messages={messages}
        currentUserId={user?.uid}
        isLoading={messagesLoading}
      />

      {/* Zone de saisie */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
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
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
