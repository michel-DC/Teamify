"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { TokenValidationProvider } from "@/components/TokenValidationProvider";

interface InviteClientGateProps {
  children: ReactNode;
}

export default function InviteClientGate({ children }: InviteClientGateProps) {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [authChecked, setAuthChecked] = useState<boolean | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Vérifier d'abord le localStorage pour une vérification rapide
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (!isLoggedIn) {
          setAuthChecked(false);
          setRedirecting(true);
          return;
        }

        // Vérifier l'authentification côté serveur
        const authResult = await checkAuth();
        const isAuthenticated = authResult.isAuthenticated;

        setAuthChecked(isAuthenticated);

        if (!isAuthenticated) {
          // Nettoyer le localStorage si l'authentification échoue
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("hasOrganization");

          setRedirecting(true);

          // Afficher le toast d'information
          import("sonner").then(({ toast }) => {
            toast.info("Session expirée. Veuillez vous reconnecter 🛡️", {
              duration: 2000,
            });
          });

          // Rediriger vers la page de connexion
          setTimeout(() => {
            router.replace("/auth/login");
          }, 2000);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification d'authentification:",
          error
        );
        setAuthChecked(false);
        setRedirecting(true);
        router.replace("/auth/login");
      }
    };

    verifyAuth();
  }, [checkAuth, router]);

  const isLoading = authChecked !== true || redirecting;

  if (isLoading) {
    return <LoadingScreen text="Vérification de votre session..." />;
  }

  return (
    <TokenValidationProvider
      checkInterval={5 * 60 * 1000} // Vérification toutes les 5 minutes
      redirectDelay={2000} // 2 secondes avant redirection
      customMessage="Votre session a expiré. Vous allez être redirigé vers la page de connexion."
    >
      {children}
    </TokenValidationProvider>
  );
}
