"use client";

import { useEffect } from "react";
import { useTokenValidation } from "@/hooks/useTokenValidation";

interface TokenValidationProviderProps {
  children: React.ReactNode;
  /**
   * Intervalle de vérification en millisecondes (défaut: 5 minutes)
   */
  checkInterval?: number;
  /**
   * Délai avant redirection en millisecondes (défaut: 2 secondes)
   */
  redirectDelay?: number;
  /**
   * Message personnalisé pour le toast
   */
  customMessage?: string;
}

/**
 * Provider pour la validation automatique du token JWT
 * Vérifie périodiquement la validité du token et déconnecte l'utilisateur si nécessaire
 */
export const TokenValidationProvider = ({
  children,
  checkInterval,
  redirectDelay,
  customMessage,
}: TokenValidationProviderProps) => {
  const { startTokenValidation, stopTokenValidation } = useTokenValidation({
    checkInterval,
    redirectDelay,
    customMessage,
  });

  useEffect(() => {
    // Démarrer la validation du token au montage du composant
    startTokenValidation();

    // Arrêter la validation à la destruction du composant
    return () => {
      stopTokenValidation();
    };
  }, [startTokenValidation, stopTokenValidation]);

  return <>{children}</>;
};
