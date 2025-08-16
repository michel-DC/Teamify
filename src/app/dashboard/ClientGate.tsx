"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/Loader";
import { useAuth } from "@/context/auth/authController";
import { useOrganization } from "@/hooks/useOrganization";

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

  useEffect(() => {
    const ok = checkAuth();
    setAuthChecked(ok);
    if (!ok) {
      setRedirecting(true);
      router.replace("/auth/login");
    }
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

  return <>{children}</>;
}
