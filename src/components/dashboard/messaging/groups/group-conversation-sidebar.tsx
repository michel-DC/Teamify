"use client";

import { useState } from "react";
import { useGroupConversations } from "@/hooks/useGroupConversations";
import { useAutoSignedImage } from "@/hooks/useAutoSignedImage";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Users } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OrganizationInfo } from "./organization-info";

interface GroupConversationSidebarProps {
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  user: any;
  onCloseSidebar?: () => void;
}

/**
 * Sidebar des conversations de groupe pour une organisation
 */
export const GroupConversationSidebar = ({
  selectedConversationId,
  onConversationSelect,
  user,
  onCloseSidebar,
}: GroupConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useGroupConversations({
    autoFetch: true,
    autoSync: true,
  });

  /**
   * Filtrer les conversations de groupe selon la recherche
   */
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return conv.title?.toLowerCase().includes(searchLower) || false;
  });

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

  return (
    <>
      {/* Header de la sidebar */}
      <div className="p-2 border-b bg-background mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Conversations de groupe</h2>
          </div>
          {/* Bouton fermer sur mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseSidebar}
            className="md:hidden"
          >
            <X className="h-4 w-4 text-[#7C3AED]" />
          </Button>
        </div>
      </div>

      <OrganizationInfo />

      {/* Liste des conversations */}
      <div className="flex-1 overflow-hidden">
        {conversationsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Chargement des conversations...
              </p>
            </div>
          </div>
        ) : conversationsError ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <MessageCircle className="h-8 w-8  mx-auto mb-2 text-[#7C3AED] " />
              <p className="text-sm text-muted-foreground">
                Erreur lors du chargement
              </p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Users className="h-8 w-8 text-[#7C3AED]  mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Aucune conversation trouvée"
                  : "Aucune conversation de groupe"}
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => {
                const ConversationAvatar = () => {
                  const { signedUrl } = useAutoSignedImage(
                    getConversationAvatar(conversation)
                  );

                  return (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={signedUrl || undefined} />
                      <AvatarFallback>
                        {getConversationInitials(conversation)}
                      </AvatarFallback>
                    </Avatar>
                  );
                };

                return (
                  <div
                    key={conversation.id}
                    onClick={() => onConversationSelect(conversation.id)}
                    className={`
                      p-2 rounded-lg cursor-pointer transition-colors border
                      ${
                        selectedConversationId === conversation.id
                          ? "bg-muted/50 border-2 border-accent"
                          : "border-border hover:bg-muted"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <ConversationAvatar />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate text-sm">
                            {getConversationDisplayName(conversation)}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1 text-[#7C3AED]" />
                              {getMemberCount(conversation)}
                            </Badge>
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 w-5 p-0 flex items-center justify-center text-xs text-[#7C3AED]"
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {conversation.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {conversation.lastMessage.sender.firstname}:{" "}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </>
  );
};
