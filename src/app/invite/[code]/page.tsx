"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, Users, Building2, User } from "lucide-react";

interface InvitationData {
  organization: {
    id: number;
    name: string;
    bio?: string;
    organizationType: string;
    memberCount: number;
    mission?: string;
  };
  invitedBy: {
    firstname: string | null;
    lastname: string | null;
    email: string;
  };
}

/**
 * Page pour traiter une invitation d'organisation via le code d'invitation
 * Affiche les détails de l'invitation et gère les cas utilisateur connecté et non connecté
 */
export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(
    null
  );
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteCode = params.code as string;

  /**
   * Vérification de l'authentification utilisateur
   */
  const checkAuthentication = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsAuthenticated(isLoggedIn);
    return isLoggedIn;
  };

  /**
   * Récupération des détails de l'invitation
   */
  const fetchInvitationDetails = async () => {
    try {
      const response = await fetch(`/api/invite/${inviteCode}/details`);
      const data = await response.json();

      if (data.success) {
        setInvitationData(data.invitation);
      } else {
        setError(data.error || "Invitation non trouvée");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
      setError("Erreur lors du chargement de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Traitement de l'invitation
   */
  const handleInvitation = async () => {
    if (!inviteCode) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/invite/${inviteCode}`);
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        if (data.redirect && data.url) {
          router.push(data.url);
        }
      } else if (data.redirect && data.url) {
        // Redirection vers l'inscription avec le code d'invitation
        router.push(data.url);
      } else {
        toast.error(data.error || "Erreur lors du traitement de l'invitation");
      }
    } catch (error) {
      console.error("Erreur lors du traitement de l'invitation:", error);
      toast.error("Erreur lors du traitement de l'invitation");
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Refus de l'invitation
   */
  const handleDeclineInvitation = async () => {
    if (!inviteCode) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/invite/${inviteCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "decline" }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Redirection vers l'accueil après refus
        setTimeout(() => {
          router.push("/");
        }, 5000);
      } else {
        toast.error(data.error || "Erreur lors du refus de l'invitation");
      }
    } catch (error) {
      console.error("Erreur lors du refus de l'invitation:", error);
      toast.error("Erreur lors du refus de l'invitation");
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Vérification de l'invitation au chargement
   */
  useEffect(() => {
    if (!inviteCode) {
      setError("Code d'invitation invalide");
      setLoading(false);
      return;
    }

    // Vérifier l'authentification
    checkAuthentication();

    // Récupérer les détails de l'invitation
    fetchInvitationDetails();
  }, [inviteCode]);

  /**
   * Traitement automatique si utilisateur connecté
   */
  useEffect(() => {
    if (isAuthenticated === true && invitationData && !processing) {
      handleInvitation();
    }
  }, [isAuthenticated, invitationData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Invitation invalide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Invitation à rejoindre
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Vous avez été invité à rejoindre une organisation sur Teamify
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Détails de l'organisation */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h3 className="font-semibold text-base text-gray-900">
              {invitationData.organization.name}
            </h3>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {invitationData.organization.organizationType}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Users className="w-3 h-3" />
                <span>
                  {invitationData.organization.memberCount} membre
                  {invitationData.organization.memberCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {invitationData.organization.mission && (
              <p className="text-xs text-gray-600">
                <strong>Mission :</strong> {invitationData.organization.mission}
              </p>
            )}

            {invitationData.organization.bio && (
              <p className="text-xs text-gray-600">
                {invitationData.organization.bio}
              </p>
            )}
          </div>

          {/* Informations sur l'invitation */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <User className="w-3 h-3" />
              <span>Invitation envoyée par :</span>
            </div>
            <p className="font-medium text-sm text-gray-900">
              {invitationData.invitedBy.firstname}{" "}
              {invitationData.invitedBy.lastname}
            </p>
            <p className="text-xs text-gray-500">
              {invitationData.invitedBy.email}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-3">
            {isAuthenticated === true ? (
              <div className="space-y-2">
                <Button
                  onClick={handleInvitation}
                  disabled={processing}
                  className="w-full h-9"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Rejoindre l'organisation
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDeclineInvitation}
                  disabled={processing}
                  variant="outline"
                  className="w-full h-9"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-2"></div>
                      Refus en cours...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 mr-2"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      Refuser l'invitation
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Vous allez être automatiquement ajouté à l'organisation
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() =>
                    router.push(`/auth/register?invite=${inviteCode}`)
                  }
                  className="w-full h-9"
                >
                  Créer un compte et rejoindre
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/auth/login?invite=${inviteCode}`)
                  }
                  className="w-full h-9"
                >
                  Se connecter et rejoindre
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  className="w-full h-9 text-gray-500 hover:text-gray-700"
                >
                  Retour à l'accueil
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Vous devez avoir un compte pour rejoindre l'organisation
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
