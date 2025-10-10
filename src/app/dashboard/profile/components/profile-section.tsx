"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X, UserCheck, Calendar } from "lucide-react";
import { LocationSearch } from "./location-search";

import { UserProfile } from "../types";

interface ProfileSectionProps {
  userProfile: UserProfile;
  onProfileUpdate: (updatedProfile: Partial<UserProfile>) => void;
}

export function ProfileSection({
  userProfile,
  onProfileUpdate,
}: ProfileSectionProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstname: userProfile.firstname,
    lastname: userProfile.lastname,
    bio: userProfile.bio || "",
    location: userProfile.location || undefined,
  });

  const handleInputChange = (
    field: keyof UserProfile,
    value:
      | string
      | Date
      | { city: string; coordinates: { lat: number; lon: number } }
      | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onProfileUpdate(formData);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstname: userProfile.firstname,
      lastname: userProfile.lastname,
      bio: userProfile.bio || "",
      location: userProfile.location || undefined,
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Informations personnelles</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline" size="sm">
            <Edit3 className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-[#7C3AED] hover:bg-[#7C3AED] text-white border border-[#7C3AED] shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      {/* Disclaimer de confidentialité */}
      <div className="text-xs text-muted-foreground border-l-2 border-border pl-3 py-2">
        <p>
          Les informations de ce profil peuvent être visibles publiquement par
          d'autres utilisateurs de la plateforme.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="firstname">Prénom</Label>
            {editing ? (
              <Input
                id="firstname"
                value={formData.firstname || ""}
                onChange={(e) => handleInputChange("firstname", e.target.value)}
                placeholder="Votre prénom"
                className="bg-white"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile.firstname || "Non renseigné"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="lastname">Nom</Label>
            {editing ? (
              <Input
                id="lastname"
                value={formData.lastname || ""}
                onChange={(e) => handleInputChange("lastname", e.target.value)}
                placeholder="Votre nom"
                className="bg-white"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile.lastname || "Non renseigné"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {userProfile.email}
            </p>
            <p className="text-xs text-muted-foreground">
              L'email ne peut pas être modifié
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="location"></Label>
            {editing ? (
              <LocationSearch
                value={formData.location}
                onChange={(location) => handleInputChange("location", location)}
                placeholder="Rechercher une ville..."
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile.location
                  ? `${
                      userProfile.location.city
                    } (${userProfile.location.coordinates.lat.toFixed(
                      4
                    )}, ${userProfile.location.coordinates.lon.toFixed(4)})`
                  : "Non renseigné"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Biographie</Label>
        {editing ? (
          <Textarea
            id="bio"
            value={formData.bio || ""}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Parlez-nous de vous..."
            rows={4}
            className="bg-white"
          />
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            {userProfile.bio || "Aucune biographie renseignée"}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Membre depuis le{" "}
            {new Date(userProfile.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          <span>
            Dernière mise à jour le{" "}
            {new Date(userProfile.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
