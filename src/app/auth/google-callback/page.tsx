"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Page de callback pour l'authentification Google
 * Traite le code d'autorisation et effectue la connexion
 */
export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const processGoogleAuth = async () => {
      const code = searchParams.get("code");

      if (!code) {
        setError("Code d'autorisation manquant");
        setIsProcessing(false);
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
        toast.success("Connexion Google réussie !", {
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

        // Utiliser window.location.href pour une redirection complète
        window.location.href = redirectPath;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur inconnue");
        setIsProcessing(false);
      }
    };

    processGoogleAuth();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Erreur d'authentification
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Connexion en cours...</h2>
          <p className="text-muted-foreground">
            Nous traitons votre authentification Google
          </p>
        </div>
      </div>
    </div>
  );
}
