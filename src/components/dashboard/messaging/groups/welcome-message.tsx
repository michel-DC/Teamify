"use client";

import { useEffect } from "react";
import { useSocketSimple } from "@/hooks/useSocketSimple";
import { useAuth } from "@/hooks/useAuth";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

interface WelcomeMessageProps {
  conversationId: string;
  onMessageSent?: () => void;
}

/**
 * Composant pour envoyer automatiquement un message de bienvenue dans la conversation de groupe
 */
export const WelcomeMessage = ({
  conversationId,
  onMessageSent,
}: WelcomeMessageProps) => {
  const { user } = useAuth();
  const { activeOrganization } = useActiveOrganization();
  const { sendMessage, isConnected } = useSocketSimple({
    currentUserId: user?.uid,
  });

  useEffect(() => {
    if (!conversationId || !isConnected || !user || !activeOrganization) {
      return;
    }

    // Vérifier si c'est une nouvelle organisation (créée récemment)
    const isNewOrganization =
      activeOrganization.createdAt &&
      new Date(activeOrganization.createdAt).getTime() > Date.now() - 60000; // Créée il y a moins d'1 minute

    if (isNewOrganization) {
      const welcomeText = `🎉 Bienvenue dans ${activeOrganization.name} !\n\nCette conversation de groupe permet à tous les membres de l'organisation de communiquer ensemble. N'hésitez pas à partager des informations importantes ou à poser des questions à l'équipe.`;

      // Envoyer le message de bienvenue
      const success = sendMessage({
        conversationId,
        content: welcomeText,
      });

      if (success && onMessageSent) {
        onMessageSent();
      }
    }
  }, [
    conversationId,
    isConnected,
    user,
    activeOrganization,
    sendMessage,
    onMessageSent,
  ]);

  return null; // Ce composant n'affiche rien
};
