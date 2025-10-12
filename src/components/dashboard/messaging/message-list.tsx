"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message } from "@/hooks/useMessages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  isLoading?: boolean;
  onDeleteMessage?: (messageId: string) => void;
  isGroupConversation?: boolean; // Nouvelle prop pour identifier les conversations de groupe
}

/**
 * Composant pour afficher la liste des messages responsive
 */
export const MessageList = ({
  messages,
  currentUserId,
  isLoading = false,
  onDeleteMessage,
  isGroupConversation = false,
}: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  /**
   * Faire défiler vers le bas automatiquement
   */
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        // Attendre un tick pour s'assurer que le DOM est mis à jour
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 0);
      }
    }
  }, [messages]);

  /**
   * Faire défiler vers le bas quand de nouveaux messages arrivent
   */
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector(
            "[data-radix-scroll-area-viewport]"
          );
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  /**
   * Formater l'heure d'un message
   */
  const formatMessageTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }

      return format(dateObj, "HH:mm", { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Invalid date";
    }
  };

  /**
   * Obtenir le nom d'affichage de l'expéditeur
   */
  const getSenderDisplayName = (message: Message) => {
    if (!message.sender) return "Utilisateur";

    const { firstname, lastname } = message.sender;
    const fullName = `${firstname || ""} ${lastname || ""}`.trim();

    return fullName || "Utilisateur";
  };

  /**
   * Gérer la suppression d'un message
   */
  const handleDeleteMessage = async (messageId: string) => {
    if (!onDeleteMessage) return;

    try {
      await onDeleteMessage(messageId);
      toast.success("Message supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du message");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Chargement des messages...
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm md:text-base">
            Aucun message dans cette conversation
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Envoyez le premier message pour commencer la conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full">
      <div className="p-3 md:p-4 space-y-3">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex group relative ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {/* Contenu du message */}
              <div className={`flex flex-col w-64 md:w-80 relative`}>
                {/* Nom de l'expéditeur pour les conversations de groupe */}
                {isGroupConversation && !isCurrentUser && (
                  <p className="text-xs text-muted-foreground mb-1 px-1">
                    {getSenderDisplayName(message)}
                  </p>
                )}

                {/* Bulle de message */}
                <div
                  className={`rounded-lg px-3 py-2 text-sm min-h-[40px] flex items-center ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words w-full">
                    {message.content}
                  </p>
                </div>

                {/* Heure du message */}
                <p
                  className={`text-xs text-muted-foreground mt-1 ${
                    isCurrentUser ? "text-right" : "text-left"
                  }`}
                >
                  {formatMessageTime(message.createdAt)}
                </p>

                {/* Menu d'options pour les messages de l'utilisateur - Positionné au-dessus */}
                {isCurrentUser && onDeleteMessage && (
                  <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-background border shadow-sm hover:bg-muted/50"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Supprimer le message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {/* Espace en bas pour s'assurer que le dernier message est visible */}
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
};
