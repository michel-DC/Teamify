"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loader-google";
import { Button } from "@/components/ui/button";

/**
 * Composant de contenu pour le callback Google
 * Contient la logique d'authentification avec useSearchParams
 */
export function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const processGoogleAuth = async () => {
      // Protection contre les appels multiples
      if (isProcessingRef.current) {
        return;
      }

      isProcessingRef.current = true;

      const code = searchParams.get("code");

      if (!code) {
        setError("Code d'autorisation manquant");
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      try {
        // Appeler notre API d'authentification Google
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de l'authentification"
          );
        }

        const data = await response.json();

        // Mettre à jour le localStorage pour la compatibilité avec l'ancien système
        localStorage.setItem("isLoggedIn", "true");

        // Afficher un message de succès
        toast.success("Connexion Google réussie 🎉", {
          duration: 3000,
        });

        // Rediriger selon si l'utilisateur a une organisation
        const redirectPath = data.hasOrganization
          ? "/dashboard"
          : "/create-organization";

        // Éviter les redirections multiples
        if (hasRedirected) {
          return;
        }

        setHasRedirected(true);

        // Délai court pour permettre au toast de s'afficher
        setTimeout(() => {
          // Utiliser window.location.href pour une redirection complète
          window.location.href = redirectPath;
        }, 100);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur inconnue");
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    };

    processGoogleAuth();
  }, [searchParams, router, hasRedirected]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Erreur d'authentification
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}
