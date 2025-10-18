import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export const useAuth = () => {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  const loginWithGoogle = useCallback(async (inviteCode?: string) => {
    try {
      setIsSyncing(true);

      const googleAuthUrl = new URL(
        "https://accounts.google.com/o/oauth2/v2/auth"
      );

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
      const redirectUri = `${window.location.origin}/api/auth/google/callback`;

      googleAuthUrl.searchParams.set("client_id", clientId);
      googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
      googleAuthUrl.searchParams.set("response_type", "code");
      googleAuthUrl.searchParams.set("scope", "openid email profile");
      googleAuthUrl.searchParams.set("access_type", "offline");
      googleAuthUrl.searchParams.set("prompt", "consent");

      window.location.href = googleAuthUrl.toString();
    } catch (error) {
      toast.error("Erreur réseau lors de la connexion");
      setIsSyncing(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("hasOrganization");

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      sessionStorage.setItem("showLogoutMessage", "true");

      router.push("/auth/login");

      toast.success("Vous avez été déconnecté avec succès 🥵", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn) {
        return { isAuthenticated: false, user: null };
      }

      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        return { isAuthenticated: true, user: user.user };
      }

      let errorMessage = "Erreur d'authentification";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
      }

      return { isAuthenticated: false, user: null, error: errorMessage };
    } catch (error) {
      console.error(error);
      return {
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }, []);

  return {
    isSyncing,
    loginWithGoogle,
    logout,
    checkAuth,
  };
};
