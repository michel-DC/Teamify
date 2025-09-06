"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Eye, EyeOff, Lock, Shield, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useChangePassword } from "@/hooks/useChangePassword";
import { toast } from "sonner";

export function SecuritySection() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { isLoading, changePassword, isGoogleUser, isLoadingCheck } =
    useChangePassword();

  // Gestion des changements de valeur des inputs
  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isGoogleUser) {
        toast.error(
          "Impossible de changer le mot de passe pour un compte Google"
        );
        return;
      }
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGoogleUser) {
      toast.error(
        "Impossible de changer le mot de passe pour un compte Google"
      );
      return;
    }

    await changePassword(formData);

    // Réinitialisation du formulaire après succès
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Gestion du focus des inputs pour les utilisateurs Google
  const handleInputFocus = () => {
    if (isGoogleUser) {
      toast.error(
        "Impossible de changer le mot de passe pour un compte Google"
      );
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sécurité et confidentialité</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Changer le mot de passe
          </CardTitle>
          {isLoadingCheck ? (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Vérification du type de compte...</span>
            </div>
          ) : isGoogleUser ? (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Compte Google - Impossible de changer le mot de passe</span>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe actuel"
                    value={formData.currentPassword}
                    onChange={handleInputChange("currentPassword")}
                    onFocus={handleInputFocus}
                    disabled={isGoogleUser}
                    className={
                      isGoogleUser ? "opacity-50 cursor-not-allowed" : ""
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isGoogleUser}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Votre nouveau mot de passe"
                    value={formData.newPassword}
                    onChange={handleInputChange("newPassword")}
                    onFocus={handleInputFocus}
                    disabled={isGoogleUser}
                    className={
                      isGoogleUser ? "opacity-50 cursor-not-allowed" : ""
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isGoogleUser}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    onFocus={handleInputFocus}
                    disabled={isGoogleUser}
                    className={
                      isGoogleUser ? "opacity-50 cursor-not-allowed" : ""
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isGoogleUser}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isGoogleUser || isLoading}
                onClick={() => {
                  if (isGoogleUser) {
                    toast.error(
                      "Impossible de changer le mot de passe pour un compte Google"
                    );
                  }
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sessions actives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Session actuelle</p>
                <p className="text-sm text-muted-foreground">
                  {navigator.userAgent.includes("Windows")
                    ? "Windows"
                    : "Autre"}{" "}
                  • {new Date().toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary">Actuelle</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
