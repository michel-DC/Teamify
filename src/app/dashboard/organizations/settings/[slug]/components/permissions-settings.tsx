"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Save, AlertTriangle } from "lucide-react";

interface OrganizationPermissions {
  id: number;
  organizationId: number;
  // Permissions pour les ADMIN
  adminsCanModifyEvents: boolean;
  adminsCanDeleteEvents: boolean;
  adminsCanInviteEventParticipants: boolean;
  adminsCanInviteMembers: boolean;
  adminsCanModifyOrg: boolean;
  // Permissions pour les MEMBER
  membersCanInviteEventParticipants: boolean;
  membersCanInviteMembers: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PermissionsSettingsProps {
  organizationId: number;
  organizationPublicId: string;
  userRole: "OWNER" | "ADMIN" | "MEMBER" | null;
}

export function PermissionsSettings({
  organizationId,
  organizationPublicId,
  userRole,
}: PermissionsSettingsProps) {
  const [permissions, setPermissions] =
    useState<OrganizationPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Permissions pour les ADMIN
    adminsCanModifyEvents: true,
    adminsCanDeleteEvents: true,
    adminsCanInviteEventParticipants: true,
    adminsCanInviteMembers: true,
    adminsCanModifyOrg: false,

    // Permissions pour les MEMBER
    membersCanInviteEventParticipants: false,
    membersCanInviteMembers: false,
  });

  /**
   * Récupération des permissions de l'organisation
   */
  useEffect(() => {
    fetchPermissions();
  }, [organizationId]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch(
        `/api/organizations/settings/${organizationPublicId}/permissions`
      );
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
        if (data.permissions) {
          setFormData({
            adminsCanModifyEvents:
              data.permissions.adminsCanModifyEvents ?? true,
            adminsCanDeleteEvents:
              data.permissions.adminsCanDeleteEvents ?? true,
            adminsCanInviteEventParticipants:
              data.permissions.adminsCanInviteEventParticipants ?? true,
            adminsCanInviteMembers:
              data.permissions.adminsCanInviteMembers ?? true,
            adminsCanModifyOrg: data.permissions.adminsCanModifyOrg || false,
            membersCanInviteEventParticipants:
              data.permissions.membersCanInviteEventParticipants || false,
            membersCanInviteMembers:
              data.permissions.membersCanInviteMembers || false,
          });
        }
      } else {
        // Si aucune permission n'existe, utiliser les valeurs par défaut
        setFormData({
          adminsCanModifyEvents: true,
          adminsCanDeleteEvents: true,
          adminsCanInviteEventParticipants: true,
          adminsCanInviteMembers: true,
          adminsCanModifyOrg: false,
          membersCanInviteEventParticipants: false,
          membersCanInviteMembers: false,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des permissions:", error);
      toast.error("Erreur lors de la récupération des permissions");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sauvegarde des permissions
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `/api/organizations/settings/${organizationPublicId}/permissions`,
        {
          method: permissions ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Permissions mises à jour avec succès");
        fetchPermissions(); // Recharger les données
      } else {
        const error = await response.json();
        toast.error(
          error.message || "Erreur lors de la mise à jour des permissions"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des permissions:", error);
      toast.error("Erreur lors de la mise à jour des permissions");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Gestion des changements de permissions
   */
  const handlePermissionChange = (permission: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [permission]: value }));
  };

  if (userRole !== "OWNER") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seul le propriétaire de l'organisation peut modifier les
            autorisations.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement des permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autorisations de l'organisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Configurez les permissions pour les différents rôles dans votre
              organisation.
            </div>

            {/* Permissions pour les administrateurs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <h3 className="font-medium">Permissions des administrateurs</h3>
              </div>

              <div className="space-y-4 pl-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="adminsCanModifyEvents"
                      className="text-sm font-medium"
                    >
                      Modifier les événements
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permettre aux administrateurs de modifier les événements
                    </p>
                  </div>
                  <Switch
                    id="adminsCanModifyEvents"
                    checked={formData.adminsCanModifyEvents}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("adminsCanModifyEvents", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="adminsCanDeleteEvents"
                      className="text-sm font-medium"
                    >
                      Supprimer les événements
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permettre aux administrateurs de supprimer les événements
                    </p>
                  </div>
                  <Switch
                    id="adminsCanDeleteEvents"
                    checked={formData.adminsCanDeleteEvents}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("adminsCanDeleteEvents", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="adminsCanInviteEventParticipants"
                      className="text-sm font-medium"
                    >
                      Inviter des participants aux événements
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permettre aux administrateurs d'inviter des participants
                    </p>
                  </div>
                  <Switch
                    id="adminsCanInviteEventParticipants"
                    checked={formData.adminsCanInviteEventParticipants}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "adminsCanInviteEventParticipants",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="adminsCanInviteMembers"
                      className="text-sm font-medium"
                    >
                      Inviter des membres dans l'organisation
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permettre aux administrateurs d'inviter de nouveaux
                      membres
                    </p>
                  </div>
                  <Switch
                    id="adminsCanInviteMembers"
                    checked={formData.adminsCanInviteMembers}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("adminsCanInviteMembers", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="adminsCanModifyOrg"
                      className="text-sm font-medium"
                    >
                      Modifier l'organisation
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permettre aux administrateurs de modifier les informations
                      de l'organisation
                    </p>
                  </div>
                  <Switch
                    id="adminsCanModifyOrg"
                    checked={formData.adminsCanModifyOrg}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("adminsCanModifyOrg", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Permissions pour les membres */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="font-medium">Permissions des membres</h3>
              </div>

              <div className="space-y-4 pl-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="membersCanInviteEventParticipants"
                      className="text-sm font-medium"
                    >
                      Inviter des participants aux événements
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permettre aux membres d'inviter des participants aux
                      événements
                    </p>
                  </div>
                  <Switch
                    id="membersCanInviteEventParticipants"
                    checked={formData.membersCanInviteEventParticipants}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "membersCanInviteEventParticipants",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="membersCanInviteMembers"
                      className="text-sm font-medium"
                    >
                      Inviter des membres dans l'organisation
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permettre aux membres d'inviter de nouveaux utilisateurs
                      dans l'organisation
                    </p>
                  </div>
                  <Switch
                    id="membersCanInviteMembers"
                    checked={formData.membersCanInviteMembers}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("membersCanInviteMembers", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Permissions du propriétaire */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <h3 className="font-medium">Permissions du propriétaire</h3>
              </div>

              <div className="space-y-2 pl-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Accès complet à toutes les fonctionnalités</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Gestion des membres et des rôles</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Configuration des autorisations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Suppression de l'organisation</span>
                </div>
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="pt-4">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Sauvegarde..." : "Sauvegarder les permissions"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avertissement */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Attention aux permissions
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Les modifications des autorisations peuvent affecter la sécurité
                et la gestion de votre organisation. Assurez-vous de bien
                comprendre les implications avant de sauvegarder.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
