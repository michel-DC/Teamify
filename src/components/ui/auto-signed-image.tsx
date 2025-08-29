"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAutoSignedImage } from "@/hooks/useAutoSignedImage";
import { RefreshCw, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface AutoSignedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  refreshThreshold?: number;
  showRefreshButton?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

/**
 * @param Composant d'image avec gestion automatique des URLs signées
 *
 * Affiche une image en régénérant automatiquement l'URL signée
 * à chaque requête pour éviter les erreurs d'expiration.
 */
export function AutoSignedImage({
  src,
  alt,
  className,
  fallbackSrc,
  onError,
  onLoad,
  refreshThreshold = 60,
  showRefreshButton = false,
  loadingComponent,
  errorComponent,
}: AutoSignedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<Error | null>(null);

  const { signedUrl, isLoading, error, refresh, isSigned } = useAutoSignedImage(
    src,
    {
      refreshThreshold,
      autoRefresh: true,
    }
  );

  /**
   * @param Gestion du chargement de l'image
   */
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(null);
    onLoad?.();
  };

  /**
   * @param Gestion de l'erreur de l'image
   */
  const handleImageError = () => {
    setImageLoaded(false);
    const error = new Error("Impossible de charger l'image");
    setImageError(error);
    onError?.(error);
  };

  /**
   * @param Renouvellement manuel de l'URL signée
   */
  const handleManualRefresh = async () => {
    try {
      await refresh();
      setImageError(null);
    } catch (err) {
      console.error("Erreur lors du renouvellement manuel:", err);
    }
  };

  // Affichage du composant de chargement personnalisé
  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  // Affichage du loader par défaut
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted animate-pulse",
          className
        )}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vérifier si on a une URL valide à afficher
  const hasValidUrl = signedUrl || src;

  // Affichage de l'image de fallback en cas d'erreur ET si on n'a pas d'URL valide
  if ((error || imageError) && fallbackSrc && !hasValidUrl) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        className={cn("object-cover", className)}
        onLoad={onLoad}
        width={100}
        height={100}
      />
    );
  }

  // Affichage d'un placeholder SEULEMENT si on n'a aucune URL valide
  if ((error || imageError) && !hasValidUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm">Image non disponible</span>
          {showRefreshButton && (
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }

  // Affichage du composant d'erreur personnalisé SEULEMENT si on n'a pas d'URL valide
  if (error && errorComponent && !hasValidUrl) {
    return <>{errorComponent}</>;
  }

  // Affichage de l'image
  return (
    <div className="relative w-full h-full">
      <img
        src={signedUrl || src || ""}
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-200 w-full h-full",
          !imageLoaded ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {/* Bouton de renouvellement manuel */}
      {showRefreshButton && isSigned && (
        <button
          onClick={handleManualRefresh}
          className="absolute bottom-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          title="Renouveler l'URL signée"
        >
          <RefreshCw className="h-3 w-3 text-white" />
        </button>
      )}
    </div>
  );
}
