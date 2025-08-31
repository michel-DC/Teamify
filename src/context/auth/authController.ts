import { toast } from "sonner";

/**
 * @deprecated Utilisez le hook useAuth de @/hooks/useAuth à la place
 * Ce hook est conservé pour la compatibilité avec l'existant
 */
export const useAuth = () => {
  const checkAuth = async () => {
    try {
      // Vérifier d'abord le localStorage pour la compatibilité
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn) {
        return false;
      }

      // Vérifier aussi le token JWT côté serveur
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        return true;
      } else {
        // Si le token JWT n'est pas valide, nettoyer le localStorage
        localStorage.removeItem("isLoggedIn");
        return false;
      }
    } catch (error) {
      localStorage.removeItem("isLoggedIn");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    toast.success("Vous avez été déconnecté avec succès.", { duration: 3000 });
    window.location.href = "/auth/login";
  };

  return { checkAuth, logout };
};
