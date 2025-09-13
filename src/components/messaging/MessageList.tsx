"use client";

import { useEffect, useRef } from "react";
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

  // Suppression des fonctions d'affichage des utilisateurs

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
      <div className="space-y-2">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {/* Contenu du message */}
              <div className={`flex flex-col max-w-[70%]`}>
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
                <p
                  className={`text-xs text-muted-foreground mt-1 ${
                    isCurrentUser ? "text-right" : "text-left"
                  }`}
                >
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
