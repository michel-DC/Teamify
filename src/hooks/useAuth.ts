import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook personnalisé pour l'authentification Google OAuth
 * Utilise notre système JWT personnalisé
 */
export const useAuth = () => {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Connexion avec Google via notre système OAuth personnalisé
   */
  const loginWithGoogle = useCallback(async (inviteCode?: string) => {
    try {
      setIsSyncing(true);

      // Construire l'URL d'autorisation Google
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

      // Rediriger vers Google OAuth
      window.location.href = googleAuthUrl.toString();
    } catch (error) {
      toast.error("Erreur réseau lors de la connexion");
      setIsSyncing(false);
    }
  }, []);

  /**
   * Déconnexion avec notre système JWT
   */
  const logout = useCallback(async () => {
    try {
      // Nettoyer localStorage
      localStorage.removeItem("isLoggedIn");

      // Déconnexion JWT (votre système existant)
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Stocker le message de déconnexion
      sessionStorage.setItem("showLogoutMessage", "true");

      // Redirection
      router.push("/auth/login");

      toast.success("Vous avez été déconnecté avec succès 🥵", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  }, [router]);

  /**
   * Vérification d'authentification JWT
   */
  const checkAuth = useCallback(async () => {
    try {
      // Vérifier d'abord le localStorage pour une vérification rapide
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      // Vérifier les cookies
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("token=")
      );

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

      // Si la réponse n'est pas ok, essayer de récupérer l'erreur
      let errorMessage = "Erreur d'authentification";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Impossible de parser l'erreur
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
