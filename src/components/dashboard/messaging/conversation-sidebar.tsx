"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useAutoSignedImage } from "@/hooks/useAutoSignedImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Plus, Search, X } from "lucide-react";
import { CreateConversationDialog } from "./create-conversation-dialog";
import { SidebarTrigger } from "../../ui/sidebar";

interface ConversationSidebarProps {
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  user: any;
  onCloseSidebar?: () => void;
}

/**
 * Sidebar des conversations responsive
 */
export const ConversationSidebar = ({
  selectedConversationId,
  onConversationSelect,
  user,
  onCloseSidebar,
}: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    createConversation,
    fetchConversations,
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
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={signedUrl || undefined} />
        <AvatarFallback>{getConversationInitials(conversation)}</AvatarFallback>
      </Avatar>
    );
  };

  return (
    <>
      {/* Header de la sidebar */}
      <div className="p-2 border-b bg-background mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Vos conversations</h2>
          </div>
          {/* Bouton fermer sur mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseSidebar}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
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

        {/* Bouton créer conversation */}
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full mt-3 bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 shadow-lg"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

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
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Erreur lors du chargement
              </p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Aucune conversation trouvée"
                  : "Aucune conversation"}
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`
                    p-2 rounded-lg cursor-pointer transition-colors border bg-white
                    ${
                      selectedConversationId === conversation.id
                        ? "bg-white border-2 border-accent"
                        : "border-border hover:bg-muted"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <SignedAvatar conversation={conversation} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate text-sm">
                          {getConversationDisplayName(conversation)}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="h-5 w-5 p-0 flex items-center justify-center text-xs flex-shrink-0"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
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
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Dialog de création de conversation */}
      <CreateConversationDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onConversationCreated={(conversationId) => {
          onConversationSelect(conversationId);
          setIsCreateDialogOpen(false);
        }}
        onConversationCreatedCallback={fetchConversations}
      />
    </>
  );
};
