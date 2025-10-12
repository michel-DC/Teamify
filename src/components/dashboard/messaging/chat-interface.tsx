"use client";

import { useState, useEffect, useRef } from "react";
import {
  usePusherFixed as usePusher,
  PusherMessageEvent,
  PusherMessageReadEvent,
} from "@/hooks/usePusherFixed";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, MessageCircle } from "lucide-react";

/**
 * Interface pour les conversations
 */
interface Conversation {
  id: string;
  type: "PRIVATE" | "GROUP";
  title?: string;
  members: Array<{
    id: string;
    userId: string;
    role: "MEMBER" | "ADMIN";
    user: {
      uid: string;
      firstname: string | null;
      lastname: string | null;
      profileImage: string | null;
    };
  }>;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      firstname: string | null;
      lastname: string | null;
    };
  };
  unreadCount: number;
}

/**
 * Props du composant ChatInterface
 */
interface ChatInterfaceProps {
  conversations?: Conversation[];
  onConversationSelect?: (conversationId: string) => void;
  selectedConversationId?: string;
}

/**
 * Composant d'interface de messagerie en temps réel
 */
export const ChatInterface = ({
  conversations = [],
  onConversationSelect,
  selectedConversationId,
}: ChatInterfaceProps) => {
  const { checkAuth } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<PusherMessageEvent[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [readReceipts, setReadReceipts] = useState<
    Map<string, PusherMessageReadEvent>
  >(new Map());

  // Initialiser Pusher avec le hook corrigé
  const {
    isConnected,
    isConnecting,
    error: pusherError,
    connectToChannel,
    disconnect,
    currentChannel,
  } = usePusher({
    autoConnect: false, // Désactiver la connexion automatique
    onMessage: (message: PusherMessageEvent) => {
      console.log("📨 Message reçu dans ChatInterface:", message);
      setMessages((prev) => [...prev, message]);
    },
    onMessageRead: (data: PusherMessageReadEvent) => {
      setReadReceipts((prev) => new Map(prev.set(data.messageId, data)));
    },
    onError: (error) => {
      console.error("❌ Erreur Pusher dans ChatInterface:", error);
    },
  });

  /**
   * Scroll automatique vers le bas des messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Rejoindre la conversation sélectionnée - LOGIQUE CORRIGÉE
   */
  useEffect(() => {
    if (selectedConversationId) {
      const channelName = `conversation-${selectedConversationId}`;
      console.log(`🔌 Connexion à la conversation: ${channelName}`);
      connectToChannel(channelName);
    } else {
      console.log("🔌 Aucune conversation sélectionnée, déconnexion");
      disconnect();
    }

    return () => {
      if (selectedConversationId) {
        console.log("🔌 Nettoyage de la connexion");
        disconnect();
      }
    };
  }, [selectedConversationId, connectToChannel, disconnect]);

  /**
   * Envoi d'un nouveau message
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !isConnected) {
      console.log("❌ Impossible d'envoyer le message:", {
        hasMessage: !!newMessage.trim(),
        hasConversation: !!selectedConversationId,
        isConnected,
      });
      return;
    }

    try {
      console.log("📤 Envoi du message:", {
        conversationId: selectedConversationId,
        content: newMessage.trim(),
        senderId: user?.uid,
      });

      // Envoyer le message via l'API
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          conversationId: selectedConversationId,
          content: newMessage.trim(),
          senderId: user?.uid || "unknown",
        }),
      });

      if (response.ok) {
        console.log("✅ Message envoyé avec succès");
        setNewMessage("");
        setIsTyping(false);
      } else {
        console.error("❌ Erreur lors de l'envoi du message:", response.status);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du message:", error);
    }
  };

  /**
   * Gestion de la pression sur Entrée
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Formatage du nom d'utilisateur
   */
  const formatUserName = (
    firstname: string | null,
    lastname: string | null
  ) => {
    if (firstname && lastname) {
      return `${firstname} ${lastname}`;
    }
    return firstname || lastname || "Utilisateur";
  };

  /**
   * Formatage de l'heure
   */
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Vérifier si un message est lu
   */
  const isMessageRead = (messageId: string) => {
    return readReceipts.has(messageId);
  };

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Liste des conversations */}
      <div className="w-80 border-r bg-muted/50">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </h2>
          {pusherError && (
            <Badge variant="destructive" className="mt-2">
              Erreur de connexion
            </Badge>
          )}
          {isConnecting && (
            <Badge variant="secondary" className="mt-2">
              Connexion...
            </Badge>
          )}
          {isConnected && (
            <Badge variant="default" className="mt-2">
              En ligne ({currentChannel})
            </Badge>
          )}
        </div>

        <div className="h-[calc(100%-80px)] overflow-y-auto">
          <div className="p-2 space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onConversationSelect?.(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={conversation.members[0]?.user.profileImage || ""}
                      />
                      <AvatarFallback>
                        {conversation.type === "GROUP" ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          conversation.members[0]?.user.firstname?.charAt(0) ||
                          "U"
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {conversation.title ||
                            formatUserName(
                              conversation.members[0]?.user.firstname,
                              conversation.members[0]?.user.lastname
                            )}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* En-tête de conversation */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={
                      selectedConversation.members[0]?.user.profileImage || ""
                    }
                  />
                  <AvatarFallback>
                    {selectedConversation.type === "GROUP" ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      selectedConversation.members[0]?.user.firstname?.charAt(
                        0
                      ) || "U"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation.title ||
                      formatUserName(
                        selectedConversation.members[0]?.user.firstname,
                        selectedConversation.members[0]?.user.lastname
                      )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.members.length} membre(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages
                  .filter(
                    (msg) => msg.conversationId === selectedConversationId
                  )
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.senderId === user?.uid
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.senderId !== user?.uid && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={message.sender.profileImage || ""}
                          />
                          <AvatarFallback>
                            {message.sender.firstname?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          message.senderId === user?.uid
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.senderId !== user?.uid && (
                          <p className="text-xs font-medium mb-1">
                            {formatUserName(
                              message.sender.firstname,
                              message.sender.lastname
                            )}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.senderId === user?.uid && (
                            <span className="text-xs opacity-70">
                              {isMessageRead(message.id) ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={!isConnected || !selectedConversationId}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !newMessage.trim() ||
                    !isConnected ||
                    !selectedConversationId
                  }
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!isConnected && (
                <p className="text-xs text-muted-foreground mt-2">
                  Connexion en cours...
                </p>
              )}
              {!selectedConversationId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Sélectionnez une conversation
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
