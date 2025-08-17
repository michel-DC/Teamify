"use client";

import { useState, useEffect, useRef } from "react";
import {
  generateSignedUrlForImage,
  isSignedUrl,
  getTimeUntilExpiration,
} from "@/lib/upload-utils";
import { cn } from "@/lib/utils";

interface SignedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  refreshThreshold?: number; // Seuil en secondes avant renouvellement
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

/**
 * @param Composant d'image avec gestion automatique des URLs signées
 *
 * Affiche une image avec URL signée et renouvelle automatiquement l'URL
 * avant son expiration pour maintenir l'affichage.
 */
export function SignedImage({
  src,
  alt,
  className,
  fallbackSrc,
  refreshThreshold = 60, // 1 minute avant expiration
  onError,
  onLoad,
}: SignedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSignedRef = useRef(false);

  /**
   * @param Renouvellement de l'URL signée
   */
  const refreshSignedUrl = async () => {
    try {
      const response = await generateSignedUrlForImage(src);
      setImageSrc(response.signedUrl);
      isSignedRef.current = true;

      // Programmer le prochain renouvellement
      scheduleNextRefresh(response.expiresIn);
    } catch (err) {
      console.error("Erreur lors du renouvellement de l'URL signée:", err);
      setError(
        err instanceof Error ? err : new Error("Erreur de renouvellement")
      );
      onError?.(
        err instanceof Error ? err : new Error("Erreur de renouvellement")
      );
    }
  };

  /**
   * @param Programmation du prochain renouvellement
   */
  const scheduleNextRefresh = (expiresIn: number) => {
    // Nettoyer le timeout précédent
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Calculer le délai avant renouvellement
    const timeUntilExpiration = expiresIn - refreshThreshold;
    const refreshDelay = Math.max(0, timeUntilExpiration) * 1000;

    // Programmer le renouvellement
    refreshTimeoutRef.current = setTimeout(() => {
      refreshSignedUrl();
    }, refreshDelay);
  };

  /**
   * @param Initialisation de l'image
   */
  const initializeImage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier si c'est une URL signée
      if (isSignedUrl(src)) {
        isSignedRef.current = true;

        // Vérifier le temps restant
        const timeRemaining = getTimeUntilExpiration(src);

        if (timeRemaining !== null && timeRemaining <= refreshThreshold) {
          // URL proche de l'expiration, la renouveler
          await refreshSignedUrl();
        } else if (timeRemaining !== null) {
          // Programmer le renouvellement
          scheduleNextRefresh(timeRemaining + refreshThreshold);
        }
      } else {
        // URL publique, pas besoin de renouvellement
        setImageSrc(src);
        isSignedRef.current = false;
      }
    } catch (err) {
      console.error("Erreur lors de l'initialisation de l'image:", err);
      setError(
        err instanceof Error ? err : new Error("Erreur d'initialisation")
      );
      onError?.(
        err instanceof Error ? err : new Error("Erreur d'initialisation")
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @param Gestion du chargement de l'image
   */
  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  /**
   * @param Gestion de l'erreur de l'image
   */
  const handleImageError = () => {
    setIsLoading(false);
    const error = new Error("Impossible de charger l'image");
    setError(error);
    onError?.(error);
  };

  // Initialisation au montage et quand src change
  useEffect(() => {
    initializeImage();

    // Nettoyage au démontage
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [src]);

  // Nettoyage des timeouts au démontage
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  if (error && fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={cn("object-cover", className)}
        onLoad={onLoad}
      />
    );
  }

  if (error) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted", className)}
      >
        <span className="text-sm text-muted-foreground">
          Image non disponible
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-muted",
            className
          )}
        >
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}

      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {isSignedRef.current && (
        <div className="absolute top-1 right-1">
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            title="URL signée active"
          />
        </div>
      )}
    </div>
  );
}
