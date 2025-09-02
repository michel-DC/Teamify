"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building2, Shield, Trash2 } from "lucide-react";

import { UserProfile } from "../types";

interface ProfileSidebarProps {
  userProfile: UserProfile;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function ProfileSidebar({
  userProfile,
  activeSection,
  onSectionChange,
}: ProfileSidebarProps) {
  return (
    <div className="w-80 bg-card border-r border-border h-full overflow-hidden">
      <div className="p-6">
        {/* Photo de profil */}
        <div className="text-center mb-6">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage
              src={userProfile.profileImage || ""}
              alt={`${userProfile.firstname} ${userProfile.lastname}`}
            />
            <AvatarFallback className="text-2xl">
              {userProfile.firstname?.charAt(0).toUpperCase()}
              {userProfile.lastname?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">
            {userProfile.firstname} {userProfile.lastname}
          </h3>
          <p className="text-sm text-muted-foreground">{userProfile.email}</p>
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
