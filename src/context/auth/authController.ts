import { toast } from "sonner";

export const useAuth = () => {
  const checkAuth = async () => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn) {
        return false;
      }

      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        return true;
      } else {
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
