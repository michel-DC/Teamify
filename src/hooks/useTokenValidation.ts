"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TokenValidationOptions {
  checkInterval?: number;
  redirectDelay?: number;
  customMessage?: string;
}

export const useTokenValidation = (options: TokenValidationOptions = {}) => {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  const {
    customMessage = "Session expirée. Veuillez vous reconnecter 🛡️",
  } = options;

  const checkTokenValidity = useCallback(async (): Promise<boolean> => {
    if (isCheckingRef.current) {
    }

    try {
      isCheckingRef.current = true;

      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn) {
        return false;
      }

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const isValid = response.ok;

      if (!isValid) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("hasOrganization");

        return false;
      }

      return true;
    } catch (error) {
      console.error(
        "[useTokenValidation] Erreur lors de la vérification du token:",
        error
      );
      return false;
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  const handleTokenExpiration = useCallback(async () => {
    if (hasRedirectedRef.current) {
    }

    hasRedirectedRef.current = true;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(
        "[useTokenValidation] Erreur lors de la déconnexion:",
        error
      );
    }

    toast.info(customMessage, {
      duration: redirectDelay,
    });

    setTimeout(() => {
      router.replace("/auth/login");
    }, redirectDelay);
  }, [router, customMessage, redirectDelay]);

  const startTokenValidation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    checkTokenValidity().then((isValid) => {
      if (!isValid) {
        handleTokenExpiration();
        return;
      }
    });

    intervalRef.current = setInterval(async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        handleTokenExpiration();
      }
    }, checkInterval);
  }, [checkTokenValidity, handleTokenExpiration, checkInterval]);

  const stopTokenValidation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const validateTokenNow = useCallback(async (): Promise<boolean> => {
    const isValid = await checkTokenValidity();
    if (!isValid) {
      handleTokenExpiration();
    }
    return isValid;
  }, [checkTokenValidity, handleTokenExpiration]);

  useEffect(() => {
    return () => {
      stopTokenValidation();
    };
  }, [stopTokenValidation]);

  return {
    startTokenValidation,
    stopTokenValidation,
    validateTokenNow,
    isChecking: isCheckingRef.current,
  };
};
