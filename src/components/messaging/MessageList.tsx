"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/hooks/useMessages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  isLoading?: boolean;
}

/**
 * Composant pour afficher la liste des messages
 */
export const MessageList = ({
  messages,
  currentUserId,
  isLoading = false,
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
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  /**
   * Obtenir les initiales d'un utilisateur
   */
  const getUserInitials = (user: {
    firstname?: string | null;
    lastname?: string | null;
  }) => {
    const first = user.firstname?.charAt(0) || "";
    const last = user.lastname?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  /**
   * Obtenir le nom d'affichage d'un utilisateur
   */
  const getUserDisplayName = (user: {
    firstname?: string | null;
    lastname?: string | null;
  }) => {
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    if (user.firstname) return user.firstname;
    if (user.lastname) return user.lastname;
    return "Utilisateur";
  };

  /**
   * Formater l'heure d'un message
   */
  const formatMessageTime = (date: Date) => {
    return format(new Date(date), "HH:mm", { locale: fr });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Aucun message dans cette conversation
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Envoyez le premier message pour commencer la conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          const isConsecutive =
            messages[messages.indexOf(message) - 1]?.senderId ===
            message.senderId;

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${
                isCurrentUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar (seulement si pas consécutif) */}
              {!isConsecutive && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.sender.profileImage || ""} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(message.sender)}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Contenu du message */}
              <div
                className={`flex flex-col max-w-[70%] ${
                  isCurrentUser ? "items-end" : "items-start"
                }`}
              >
                {/* Nom d'utilisateur (seulement si pas consécutif) */}
                {!isConsecutive && (
                  <p className="text-xs text-muted-foreground mb-1 px-2">
                    {getUserDisplayName(message.sender)}
                  </p>
                )}

                {/* Bulle de message */}
                <div
                  className={`rounded-lg px-3 py-2 ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {/* Heure du message */}
                <p className="text-xs text-muted-foreground mt-1 px-2">
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>

              {/* Espace pour l'avatar consécutif */}
              {isConsecutive && <div className="w-8" />}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
