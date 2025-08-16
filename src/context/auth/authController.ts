import { toast } from "sonner";

export const useAuth = () => {
  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      return false;
    }

    return true;
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    toast.success("Vous avez été déconnecté avec succès.", { duration: 3000 });
    window.location.href = "/auth/login";
  };

  return { checkAuth, logout };
};
