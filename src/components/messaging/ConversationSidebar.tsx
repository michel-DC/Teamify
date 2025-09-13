"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Plus, Search } from "lucide-react";
import { CreateConversationDialog } from "./CreateConversationDialog";

interface ConversationSidebarProps {
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  user: any;
}

/**
 * Sidebar des conversations
 */
export const ConversationSidebar = ({
  selectedConversationId,
  onConversationSelect,
  user,
}: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations({ autoFetch: true });

  /**
   * Filtrer les conversations selon la recherche
   */
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();

    // Rechercher dans le titre de la conversation
    if (conv.title?.toLowerCase().includes(searchLower)) return true;

    // Rechercher dans les noms des membres
    return conv.members.some((member) => {
      const fullName = `${member.user.firstname || ""} ${
        member.user.lastname || ""
      }`.toLowerCase();
      return fullName.includes(searchLower);
    });
  });

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

  return (
    <>
      <div className="w-80 border-r bg-background flex flex-col">
        {/* En-tête */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </h1>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des conversations */}
        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Chargement des conversations...
            </div>
          ) : conversationsError ? (
            <div className="p-4 text-center text-destructive">
              Erreur: {conversationsError}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery
                ? "Aucune conversation trouvée"
                : "Aucune conversation"}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                    selectedConversationId === conversation.id
                      ? "bg-muted border border-primary"
                      : ""
                  }`}
                  onClick={() => onConversationSelect(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getConversationAvatar(conversation)} />
                      <AvatarFallback>
                        {getConversationInitials(conversation)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {getConversationDisplayName(conversation)}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.sender.firstname}:{" "}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Dialog de création de conversation */}
      <CreateConversationDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onConversationCreated={(conversationId) => {
          onConversationSelect(conversationId);
          setIsCreateDialogOpen(false);
        }}
      />
    </>
  );
};
