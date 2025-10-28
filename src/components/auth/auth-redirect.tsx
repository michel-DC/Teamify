"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthRedirectProps {
  children: ReactNode;
  redirectTo: string;
}

export function AuthRedirect({ children, redirectTo }: AuthRedirectProps) {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const authResult = await checkAuth();
        
        if (authResult.isAuthenticated) {
          router.push(redirectTo);
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setIsChecking(false);
      }
    }

    checkAuthentication();
  }, [checkAuth, router, redirectTo]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
          aria-label="Vérification de l'authentification"
          role="status"
        />
      </div>
    );
  }

  return <>{children}</>;
}
