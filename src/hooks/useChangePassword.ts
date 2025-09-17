import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UseChangePasswordReturn {
  isLoading: boolean;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  isGoogleUser: boolean;
  isLoadingCheck: boolean;
}

export function useChangePassword(): UseChangePasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  // Vérification si l'utilisateur est un utilisateur Google
  useEffect(() => {
    const checkGoogleUser = async () => {
      try {
        const response = await fetch("/api/profile/check-google-user");
        if (response.ok) {
          const data = await response.json();
          setIsGoogleUser(data.isGoogleUser);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'utilisateur Google:",
          error
        );
      } finally {
        setIsLoadingCheck(false);
      }
    };

    checkGoogleUser();
  }, []);

  const changePassword = async (data: ChangePasswordData) => {
    // Vérification pour les utilisateurs Google
    if (isGoogleUser) {
      toast.error(
        "Impossible de changer le mot de passe pour un compte Google"
      );
      return;
    }

    // Validation côté client
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      toast.error("Tous les champs sont requis");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (data.newPassword.length < 8) {
      toast.error(
        "Le nouveau mot de passe doit contenir au moins 8 caractères"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.error || "Erreur lors du changement de mot de passe"
        );
        return;
      }

      toast.success("Mot de passe mis à jour avec succès");

      // Réinitialisation des champs (optionnel)
      // Vous pouvez ajouter une fonction de reset ici si nécessaire
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast.error("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    changePassword,
    isGoogleUser,
  };
}
