"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TokenValidationOptions {
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
 * Hook pour vérifier périodiquement la validité du JWT token
 * et déconnecter automatiquement l'utilisateur si le token est expiré
 */
export const useTokenValidation = (options: TokenValidationOptions = {}) => {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  const {
    checkInterval = 5 * 60 * 1000, // 5 minutes par défaut
    redirectDelay = 2000, // 2 secondes par défaut
    customMessage = "Votre session a expiré. Vous allez être redirigé vers la page de connexion.",
  } = options;

  /**
   * Vérifie la validité du token JWT côté serveur
   */
  const checkTokenValidity = useCallback(async (): Promise<boolean> => {
    if (isCheckingRef.current) {
      return true; // Éviter les vérifications multiples simultanées
    }

    try {
      isCheckingRef.current = true;

      // Vérifier d'abord le localStorage pour une vérification rapide
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn) {
        return false;
      }

      // Vérifier l'authentification côté serveur
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const isValid = response.ok;

      if (!isValid) {
        // Nettoyer le localStorage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("hasOrganization");

        return false;
      }

      return true;
    } catch (error) {
      console.error(
        "[useTokenValidation] Erreur lors de la vérification du token:",
        error
      );
      return false;
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  /**
   * Déconnecte l'utilisateur et le redirige vers la page de connexion
   */
  const handleTokenExpiration = useCallback(async () => {
    if (hasRedirectedRef.current) {
      return; // Éviter les redirections multiples
    }

    hasRedirectedRef.current = true;

    try {
      // Nettoyer les cookies côté serveur
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(
        "[useTokenValidation] Erreur lors de la déconnexion:",
        error
      );
    }

    // Afficher le toast d'information
    toast.info(customMessage, {
      duration: redirectDelay,
    });

    // Rediriger après le délai
    setTimeout(() => {
      router.replace("/auth/login");
    }, redirectDelay);
  }, [router, customMessage, redirectDelay]);

  /**
   * Démarre la vérification périodique du token
   */
  const startTokenValidation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Vérification immédiate
    checkTokenValidity().then((isValid) => {
      if (!isValid) {
        handleTokenExpiration();
        return;
      }
    });

    // Vérification périodique
    intervalRef.current = setInterval(async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        handleTokenExpiration();
      }
    }, checkInterval);
  }, [checkTokenValidity, handleTokenExpiration, checkInterval]);

  /**
   * Arrête la vérification périodique du token
   */
  const stopTokenValidation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Vérification manuelle du token
   */
  const validateTokenNow = useCallback(async (): Promise<boolean> => {
    const isValid = await checkTokenValidity();
    if (!isValid) {
      handleTokenExpiration();
    }
    return isValid;
  }, [checkTokenValidity, handleTokenExpiration]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      stopTokenValidation();
    };
  }, [stopTokenValidation]);

  return {
    startTokenValidation,
    stopTokenValidation,
    validateTokenNow,
    isChecking: isCheckingRef.current,
  };
};
