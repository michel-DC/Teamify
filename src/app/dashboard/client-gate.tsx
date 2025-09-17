"use client";

import { ReactNode, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { TokenValidationProvider } from "@/components/TokenValidationProvider";

interface ClientGateProps {
  children: ReactNode;
}

export default function ClientGate({ children }: ClientGateProps) {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const { organizations, loading, initialized } = useOrganization();

  const [authChecked, setAuthChecked] = useState<boolean | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [verifyingServer, setVerifyingServer] = useState(false);

  const toastShownRef = useRef(false);
  const authAttemptsRef = useRef(0);
  const maxAuthAttempts = 3;

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
          // Si l'authentification échoue mais que localStorage indique une connexion,
          // attendre un peu et réessayer (problème de synchronisation des cookies)
          if (authAttemptsRef.current < maxAuthAttempts) {
            authAttemptsRef.current++;
            setTimeout(() => {
              verifyAuth();
            }, 1000 * authAttemptsRef.current); // Délai progressif
            return;
          }

          // Nettoyer le localStorage si l'authentification échoue définitivement
          localStorage.removeItem("isLoggedIn");

          if (!toastShownRef.current) {
            toastShownRef.current = true;
            setRedirecting(true);

            import("sonner").then(({ toast }) => {
              toast.error("Session expirée. Veuillez vous reconnecter 🛡️", {
                duration: 5000,
              });
            });

            setTimeout(() => {
              router.replace("/auth/login");
            }, 2000);
          }
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

  useEffect(() => {
    const verifyServerHasOrg = async () => {
      try {
        setVerifyingServer(true);
        const res = await fetch("/api/user/has-organization", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (!data?.hasOrganization) {
          setRedirecting(true);
          router.replace("/create-organization");
        }
      } catch {
        // En cas d'erreur, on laisse l'utilisateur sur le dashboard (évite boucle)
      } finally {
        setVerifyingServer(false);
      }
    };

    if (authChecked && initialized && !loading && !redirecting) {
      if (organizations.length === 0) {
        verifyServerHasOrg();
      }
    }
  }, [
    authChecked,
    initialized,
    loading,
    organizations.length,
    redirecting,
    router,
  ]);

  const isLoading = useMemo(
    () =>
      authChecked !== true ||
      !initialized ||
      loading ||
      redirecting ||
      verifyingServer,
    [authChecked, initialized, loading, redirecting, verifyingServer]
  );

  if (isLoading) {
    return <LoadingScreen text="Chargement de votre espace..." />;
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
