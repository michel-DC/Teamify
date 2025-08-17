import { useState, useEffect, useRef, useCallback } from "react";
import {
  generateSignedUrlForImage,
  isSignedUrl,
  getTimeUntilExpiration,
} from "@/lib/upload-utils";

interface UseSignedImageOptions {
  refreshThreshold?: number; // Seuil en secondes avant renouvellement
  autoRefresh?: boolean; // Renouvellement automatique
}

interface UseSignedImageReturn {
  signedUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isSigned: boolean;
}

/**
 * @param Hook pour gérer les URLs signées avec renouvellement automatique
 *
 * Gère automatiquement le renouvellement des URLs signées avant leur expiration
 * et fournit des méthodes pour contrôler manuellement le processus.
 */
export function useSignedImage(
  imageUrl: string | null,
  options: UseSignedImageOptions = {}
): UseSignedImageReturn {
  const { refreshThreshold = 60, autoRefresh = true } = options;

  const [signedUrl, setSignedUrl] = useState<string | null>(imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * @param Génération d'une nouvelle URL signée
   */
  const generateSignedUrl = useCallback(async () => {
    if (!imageUrl) {
      setSignedUrl(null);
      setIsSigned(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await generateSignedUrlForImage(imageUrl);

      if (!abortControllerRef.current.signal.aborted) {
        setSignedUrl(response.signedUrl);
        setIsSigned(true);

        // Programmer le prochain renouvellement si activé
        if (autoRefresh) {
          scheduleNextRefresh(response.expiresIn);
        }
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error("Erreur lors de la génération de l'URL signée:", err);
        setError(
          err instanceof Error ? err : new Error("Erreur de génération")
        );
        setIsSigned(false);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [imageUrl, autoRefresh]);

  /**
   * @param Programmation du prochain renouvellement
   */
  const scheduleNextRefresh = useCallback(
    (expiresIn: number) => {
      // Nettoyer le timeout précédent
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Calculer le délai avant renouvellement
      const timeUntilExpiration = expiresIn - refreshThreshold;
      const refreshDelay = Math.max(0, timeUntilExpiration) * 1000;

      // Programmer le renouvellement
      refreshTimeoutRef.current = setTimeout(() => {
        generateSignedUrl();
      }, refreshDelay);
    },
    [refreshThreshold, generateSignedUrl]
  );

  /**
   * @param Initialisation de l'URL signée
   */
  const initializeSignedUrl = useCallback(async () => {
    if (!imageUrl) {
      setSignedUrl(null);
      setIsSigned(false);
      return;
    }

    // Vérifier si c'est déjà une URL signée
    if (isSignedUrl(imageUrl)) {
      setIsSigned(true);

      // Vérifier le temps restant
      const timeRemaining = getTimeUntilExpiration(imageUrl);

      if (timeRemaining !== null && timeRemaining <= refreshThreshold) {
        // URL proche de l'expiration, la renouveler
        await generateSignedUrl();
      } else if (timeRemaining !== null && autoRefresh) {
        // Programmer le renouvellement
        scheduleNextRefresh(timeRemaining + refreshThreshold);
        setSignedUrl(imageUrl);
      } else {
        setSignedUrl(imageUrl);
      }
    } else {
      // URL publique, pas besoin de signature
      setSignedUrl(imageUrl);
      setIsSigned(false);
    }
  }, [
    imageUrl,
    refreshThreshold,
    autoRefresh,
    generateSignedUrl,
    scheduleNextRefresh,
  ]);

  /**
   * @param Renouvellement manuel
   */
  const refresh = useCallback(async () => {
    await generateSignedUrl();
  }, [generateSignedUrl]);

  // Initialisation au montage et quand imageUrl change
  useEffect(() => {
    initializeSignedUrl();
  }, [initializeSignedUrl]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    signedUrl,
    isLoading,
    error,
    refresh,
    isSigned,
  };
}
