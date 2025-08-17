import { useState, useEffect, useCallback, useRef } from "react";

interface UseAutoSignedImageOptions {
  refreshThreshold?: number; // Seuil de rafraîchissement en secondes (défaut: 60s)
  autoRefresh?: boolean; // Renouvellement automatique activé par défaut
}

interface UseAutoSignedImageReturn {
  signedUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isSigned: boolean;
}

/**
 * @param Hook pour gérer automatiquement les URLs signées avec régénération
 *
 * Régénère automatiquement l'URL signée à chaque requête pour maintenir
 * l'affichage des images sans interruption due à l'expiration.
 */
export function useAutoSignedImage(
  imageUrl: string | null,
  options: UseAutoSignedImageOptions = {}
): UseAutoSignedImageReturn {
  const { refreshThreshold = 60, autoRefresh = true } = options;

  const [signedUrl, setSignedUrl] = useState<string | null>(imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * @param Régénération d'une URL signée fraîche
   */
  const generateFreshSignedUrl = useCallback(async () => {
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

      const response = await fetch("/api/images/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!abortControllerRef.current.signal.aborted) {
        if (data.success) {
          setSignedUrl(data.signedUrl);
          setIsSigned(true);

          // Programmer le prochain renouvellement si activé
          if (autoRefresh) {
            scheduleNextRefresh(data.expiresIn);
          }
        } else {
          throw new Error(data.error || "Erreur de génération");
        }
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.warn("Erreur lors de la génération de l'URL signée:", err);
        // Ne pas considérer comme une erreur fatale, juste utiliser l'URL originale
        setError(null);
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
        generateFreshSignedUrl();
      }, refreshDelay);
    },
    [refreshThreshold, generateFreshSignedUrl]
  );

  /**
   * @param Vérification si l'URL est déjà signée
   */
  const isSignedUrl = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.searchParams.has("X-Amz-Signature") ||
        urlObj.searchParams.has("X-Amz-Credential") ||
        urlObj.searchParams.has("X-Amz-Date")
      );
    } catch {
      return false;
    }
  }, []);

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
      // Essayer de régénérer pour avoir une URL fraîche, mais ne pas échouer
      try {
        await generateFreshSignedUrl();
      } catch {
        // En cas d'erreur, utiliser l'URL originale
        setSignedUrl(imageUrl);
      }
    } else {
      // URL publique, pas besoin de signature
      setSignedUrl(imageUrl);
      setIsSigned(false);
    }
  }, [imageUrl, isSignedUrl, generateFreshSignedUrl]);

  /**
   * @param Renouvellement manuel
   */
  const refresh = useCallback(async () => {
    await generateFreshSignedUrl();
  }, [generateFreshSignedUrl]);

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
