"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { StepWizard } from "./components/StepWizard";

interface UserData {
  organizationCount: number;
}

export default function NewOrganizationPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /**
   * Vérifie le nombre d'organisations de l'utilisateur
   */
  useEffect(() => {
    const checkOrganizationLimit = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          if (data && data[0]) {
            setUserData(data[0]);

            // Vérifier si l'utilisateur a atteint la limite
            if (data[0].organizationCount >= 3) {
              setShowForm(false);
            } else {
              setShowForm(true);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        toast.error("Erreur lors de la vérification de vos organisations");
      } finally {
        setLoading(false);
      }
    };

    checkOrganizationLimit();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Vérification de vos organisations...</p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                Limite d'organisations atteinte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Vous avez atteint la limite de 3 organisations par compte
                  utilisateur. Pour créer une nouvelle organisation, vous devrez
                  supprimer une organisation existante.
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground">
                <p>
                  Organisations actuelles : {userData?.organizationCount || 0}/3
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => router.push("/dashboard/organizations")}
                  variant="outline"
                >
                  Retour aux organisations
                </Button>
                <Button onClick={() => router.push("/dashboard")}>
                  Retour au dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Créer une nouvelle organisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-6">
              Organisations actuelles : {userData?.organizationCount || 0}/3
            </div>
            <StepWizard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
