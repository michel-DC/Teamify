"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/authController";
import { useOrganization } from "@/hooks/useOrganization";
import { LoadingScreen } from "@/components/ui/Loader";

interface ClientGateProps {
  children: ReactNode;
}

export default function ClientGate({ children }: ClientGateProps) {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const { organizations, loading, initialized } = useOrganization();

  const [authChecked, setAuthChecked] = useState<boolean | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    /**
     * @param Vérification de l'authentification utilisateur
     *
     * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
     */
    const verifyAuth = async () => {
      try {
        const ok = await checkAuth();
        setAuthChecked(ok);
        if (!ok) {
          setRedirecting(true);
          router.replace("/auth/login");
        }
      } catch (error) {
        setAuthChecked(false);
        setRedirecting(true);
        router.replace("/auth/login");
      }
    };

    verifyAuth();
  }, [checkAuth, router]);

  useEffect(() => {
    /**
     * @param Redirection si l'utilisateur possède déjà une organisation
     *
     * Si l'utilisateur est authentifié, que les organisations sont chargées,
     * et qu'il possède au moins une organisation, il est redirigé vers la création d'une nouvelle organisation dans le dashboard.
     */
    if (authChecked && initialized && !loading && !redirecting) {
      if (organizations.length > 0) {
        setRedirecting(true);
        router.replace("/dashboard/organization/new");
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
    () => authChecked !== true || !initialized || loading || redirecting,
    [authChecked, initialized, loading, redirecting]
  );

  if (isLoading) {
    return <LoadingScreen text="Préparation de l'assistant de création..." />;
  }

  return <>{children}</>;
}
