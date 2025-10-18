"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

interface WelcomeMessageProps {
  conversationId: string;
  onMessageSent?: () => void;
}

export const WelcomeMessage = ({
  conversationId,
  onMessageSent,
}: WelcomeMessageProps) => {
  const { checkAuth } = useAuth();
  const { activeOrganization } = useActiveOrganization();
  const [hasSentWelcome, setHasSentWelcome] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const authResult = await checkAuth();
      if (authResult.isAuthenticated && authResult.user) {
        setUser(authResult.user);
      }
    };
    getUser();
  }, [checkAuth]);

  useEffect(() => {
    if (!conversationId || !user || !activeOrganization || hasSentWelcome) {
      return;
    }

    const isNewOrganization =
      activeOrganization.createdAt &&
      new Date(activeOrganization.createdAt).getTime() > Date.now() - 60000; // Créée il y a moins d'1 minute

    if (isNewOrganization) {
      const welcomeText = `🎉 Bienvenue dans ${activeOrganization.name} !\n\nCette conversation de groupe permet à tous les membres de l'organisation de communiquer ensemble. N'hésitez pas à partager des informations importantes ou à poser des questions à l'équipe.`;

      const sendWelcomeMessage = async () => {
        try {
          const response = await fetch("/api/messages/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              conversationId,
              content: welcomeText,
              senderId: user.uid,
            }),
          });

          if (response.ok) {
            setHasSentWelcome(true);
            if (onMessageSent) {
              onMessageSent();
            }
          }
        } catch (error) {
          console.error(
            "Erreur lors de l'envoi du message de bienvenue:",
            error
          );
        }
      };

      sendWelcomeMessage();
    }
  }, [conversationId, user, activeOrganization, hasSentWelcome, onMessageSent]);

  return null; // Ce composant n'affiche rien
};
