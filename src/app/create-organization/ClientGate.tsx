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
    const ok = checkAuth();
    setAuthChecked(ok);
    if (!ok) {
      setRedirecting(true);
      router.replace("/auth/login");
    }
  }, [checkAuth, router]);

  useEffect(() => {
    if (authChecked && initialized && !loading && !redirecting) {
      if (organizations.length > 0) {
        setRedirecting(true);
        router.replace("/dashboard");
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
