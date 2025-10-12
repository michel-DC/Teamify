"use client";

import { useState, useEffect } from "react";
import { usePusherFixed as usePusher } from "@/hooks/usePusherFixed";
import { useMessages } from "@/hooks/useMessages";
import { useAutoSignedImage } from "@/hooks/useAutoSignedImage";
import { MessageList } from "./message-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreVertical, Send, X } from "lucide-react";

interface ConversationViewProps {
  conversationId: string;
  conversation: any;
  user: any;
  onBackToConversations?: () => void;
}

/**
 * Vue d'une conversation responsive avec zone de messages et saisie
 */
export const ConversationView = ({
  conversationId,
  conversation,
  user,
  onBackToConversations,
}: ConversationViewProps) => {
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
    isConnecting,
    error: pusherError,
    connectToChannel,
    disconnect,
  } = usePusher({
    onMessage: (message) => {
      addMessage(message);
    },
    onError: (error) => {
      console.error("❌ Erreur Pusher dans ConversationView:", error);
    },
  });

  // Rejoindre la conversation quand elle change
  useEffect(() => {
    if (conversationId && isConnected) {
      connectToChannel(`conversation-${conversationId}`);
    }

    return () => {
      if (conversationId && isConnected) {
        disconnect();
      }
    };
  }, [conversationId, isConnected, connectToChannel, disconnect]);

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

    // Pour les conversations de groupe, afficher "Groupe {nom organisation}"
    if (conversation.type === "GROUP" && conversation.organization) {
      return `Groupe ${conversation.organization.name}`;
    }

    return "Conversation";
  };

  /**
   * Obtenir l'avatar d'une conversation avec URL signée
   */
  const getConversationAvatar = (conversation: any) => {
    let imageUrl: string | null = null;

    if (conversation.type === "PRIVATE") {
      const otherMember = conversation.members.find(
        (member: any) => member.user.uid !== user?.uid
      );
      if (otherMember) {
        imageUrl = otherMember.user.profileImage;
      }
    } else if (conversation.type === "GROUP" && conversation.organization) {
      // Pour les conversations de groupe, afficher l'image de profil de l'organisation
      imageUrl = conversation.organization.profileImage;
    }

    return imageUrl;
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

    // Pour les conversations de groupe, afficher les initiales de l'organisation
    if (conversation.type === "GROUP" && conversation.organization) {
      const orgName = conversation.organization.name || "";
      return orgName.charAt(0).toUpperCase();
    }

    return "C";
  };

  /**
   * Composant Avatar avec URL signée
   */
  const SignedAvatar = ({ conversation }: { conversation: any }) => {
    const imageUrl = getConversationAvatar(conversation);
    const { signedUrl, isLoading } = useAutoSignedImage(imageUrl);

    return (
      <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
        <AvatarImage src={signedUrl || undefined} />
        <AvatarFallback>{getConversationInitials(conversation)}</AvatarFallback>
      </Avatar>
    );
  };

  /**
   * Envoyer un message
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    if (!isConnected) {
      return;
    }

    try {
      // Envoyer le message via l'API
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          conversationId: conversationId,
          content: newMessage.trim(),
          senderId: user?.uid || "unknown",
        }),
      });

      if (response.ok) {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
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

            <SignedAvatar conversation={conversation} />

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-sm md:text-base truncate">
                {getConversationDisplayName(conversation)}
              </h2>
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
          isGroupConversation={conversation?.type === "GROUP"}
        />
      </div>

      {/* Zone de saisie - Responsive */}
      <div className="p-6 mb-8 md:p-3 border-t bg-background flex-shrink-0">
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
              <Send className="h-5 w-5 text-[#7C3AED] " />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
