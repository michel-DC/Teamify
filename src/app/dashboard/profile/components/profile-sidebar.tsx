"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building2, Shield, Trash2, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { UserProfile } from "../types";

interface ProfileSidebarProps {
  userProfile: UserProfile;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onProfileUpdate?: (updatedProfile: Partial<UserProfile>) => void;
}

export function ProfileSidebar({
  userProfile,
  activeSection,
  onSectionChange,
  onProfileUpdate,
}: ProfileSidebarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB max
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Photo de profil mise à jour avec succès 🎉");

        // Mettre à jour le profil local si la fonction est fournie
        if (onProfileUpdate) {
          onProfileUpdate({ profileImage: data.profileImage });
        }
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Erreur lors de la mise à jour de la photo"
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de la mise à jour de la photo");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-80 bg-card border-r border-border h-full overflow-hidden">
      <div className="p-6">
        {/* Photo de profil avec fonctionnalité de modification */}
        <div className="text-center mb-6">
          <div
            className="relative inline-block group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-24 w-24 mx-auto mb-4 cursor-pointer transition-all duration-200 group-hover:ring-2 group-hover:ring-primary/20">
              <AvatarImage
                src={userProfile.profileImage || ""}
                alt={`${userProfile.firstname} ${userProfile.lastname}`}
              />
              <AvatarFallback className="text-2xl">
                {userProfile.firstname?.charAt(0).toUpperCase()}
                {userProfile.lastname?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Overlay de modification au hover */}
            {hovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full transition-all duration-200">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white text-gray-800"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Indicateur de chargement */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <h3 className="text-lg font-semibold">
            {userProfile.firstname} {userProfile.lastname}
          </h3>
          <p className="text-sm text-muted-foreground">{userProfile.email}</p>

          {/* Texte d'aide pour la photo */}
          <p className="text-xs text-muted-foreground mt-2">
            {userProfile.profileImage
              ? "Survolez la photo pour la modifier"
              : "Cliquez pour ajouter une photo de profil"}
          </p>
        </div>

        {/* Menu de navigation */}
        <nav className="space-y-2">
          <Button
            variant={activeSection === "profile" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-auto p-3 text-left"
            onClick={() => onSectionChange("profile")}
          >
            <User className="h-4 w-4 flex-shrink-0" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium truncate w-full">Mon profil</span>
              <span className="text-xs text-muted-foreground truncate w-full">
                Gérer mes informations personnelles
              </span>
            </div>
          </Button>

          <Button
            variant={activeSection === "organizations" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-auto p-3 text-left"
            onClick={() => onSectionChange("organizations")}
          >
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium truncate w-full">
                Gérer mes organisations
              </span>
              <span className="text-xs text-muted-foreground truncate w-full">
                Voir et gérer mes organisations
              </span>
            </div>
          </Button>

          <Button
            variant={activeSection === "security" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-auto p-3 text-left"
            onClick={() => onSectionChange("security")}
          >
            <Shield className="h-4 w-4 flex-shrink-0" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium truncate w-full">Sécurité</span>
              <span className="text-xs text-muted-foreground truncate w-full">
                Mot de passe et confidentialité
              </span>
            </div>
          </Button>

          <Button
            variant={activeSection === "delete" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-auto p-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={() => onSectionChange("delete")}
          >
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium truncate w-full">
                Supprimer mon compte
              </span>
              <span className="text-xs text-muted-foreground truncate w-full">
                Supprimer définitivement mon compte
              </span>
            </div>
          </Button>
        </nav>
      </div>
    </div>
  );
}
