"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Save, Building2, AlertTriangle } from "lucide-react";

interface Organization {
  id: number;
  publicId: string;
  name: string;
  bio: string | null;
  organizationType: string;
  mission: string;
  profileImage: string | null;
  memberCount: number;
  eventCount: number;
}

interface GeneralSettingsProps {
  organization: Organization | null;
  userRole: "OWNER" | "ADMIN" | "MEMBER" | null;
  onOrganizationUpdate: () => void;
}

const organizationTypes = [
  { value: "ASSOCIATION", label: "Association" },
  { value: "PME", label: "PME" },
  { value: "ENTREPRISE", label: "Entreprise" },
  { value: "STARTUP", label: "Startup" },
  { value: "AUTO_ENTREPRENEUR", label: "Auto-entrepreneur" },
];

export function GeneralSettings({
  organization,
  userRole,
  onOrganizationUpdate,
}: GeneralSettingsProps) {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    organizationType: "",
    mission: "",
    profileImage: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /**
   * Initialisation des données du formulaire
   */
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        bio: organization.bio || "",
        organizationType: organization.organizationType,
        mission: organization.mission,
        profileImage: null,
      });
    }
  }, [organization]);

  /**
   * Gestion des changements dans le formulaire
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Gestion de l'upload d'image
   */
  const handleImageUpload = (file: File | null) => {
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  /**
   * Sauvegarde des modifications
   */
  const handleSave = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("organizationType", formData.organizationType);
      formDataToSend.append("mission", formData.mission);

      if (formData.profileImage) {
        formDataToSend.append("profileImage", formData.profileImage);
      }

      const response = await fetch(
        `/api/organizations/settings/${organization.publicId}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Organisation mise à jour avec succès");
        onOrganizationUpdate();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Suppression de l'organisation
   */
  const handleDelete = async () => {
    if (!organization) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/settings/${organization.publicId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Organisation supprimée avec succès");
        // Redirection vers le dashboard des organisations
        window.location.href = "/dashboard/organizations";
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const canModify = userRole === "OWNER" || userRole === "ADMIN";
  const canDelete = userRole === "OWNER";

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'organisation</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!canModify}
                placeholder="Nom de l'organisation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType">Type d'organisation</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) =>
                  handleInputChange("organizationType", value)
                }
                disabled={!canModify}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Description</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={!canModify}
              placeholder="Description de l'organisation"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => handleInputChange("mission", e.target.value)}
              disabled={!canModify}
              placeholder="Mission de l'organisation"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image de profil</Label>
            <ImageUploadZone
              onImageChange={handleImageUpload}
              imagePreviewUrl={organization.profileImage}
              disabled={!canModify}
            />
          </div>

          {canModify && (
            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Zone de danger */}
      {canDelete && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zone de danger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-destructive mb-2">
                  Supprimer l'organisation
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Cette action est irréversible. Tous les événements, membres et
                  données associés à cette organisation seront définitivement
                  supprimés.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleteLoading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteLoading
                      ? "Suppression..."
                      : "Supprimer l'organisation"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Êtes-vous absolument sûr ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera
                      définitivement votre organisation et toutes les données
                      associées de nos serveurs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
