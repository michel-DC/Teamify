"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface EventDetails {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location: string;
  capacity: number;
  imageUrl?: string;
  organization: {
    name: string;
  };
}

interface InvitationDetails {
  id: number;
  invitationId: string;
  receiverName: string;
  receiverEmail: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  eventCode: string;
}

/**
 * @param Composant principal de gestion de l'invitation
 *
 * Gère l'affichage et la logique de réponse aux invitations d'événements
 */
function JoinEventContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [invitationDetails, setInvitationDetails] =
    useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invitationCode = searchParams.get("code");

  /**
   * @param Récupération des détails de l'invitation et de l'événement
   *
   * Décode le code d'invitation et récupère les informations nécessaires
   */
  useEffect(() => {
    if (!invitationCode) {
      setError("Code d'invitation manquant");
      setLoading(false);
      return;
    }

    const fetchInvitationDetails = async () => {
      try {
        const response = await fetch(
          `/api/events/invitations/validate?code=${invitationCode}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la récupération de l'invitation"
          );
        }

        const data = await response.json();
        setEventDetails(data.event);
        setInvitationDetails(data.invitation);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [invitationCode]);

  /**
   * @param Réponse à l'invitation (accepter ou décliner)
   *
   * Met à jour le statut de l'invitation en base de données
   */
  const handleResponse = async (status: "ACCEPTED" | "DECLINED") => {
    if (!invitationDetails) return;

    setResponding(true);
    try {
      const response = await fetch("/api/events/invitations/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId: `${invitationDetails.invitationId}+${invitationDetails.eventCode}`,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la réponse");
      }

      const data = await response.json();
      setInvitationDetails((prev) => (prev ? { ...prev, status } : null));

      toast.success(
        status === "ACCEPTED"
          ? "Invitation acceptée avec succès !"
          : "Invitation déclinée avec succès !"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la réponse"
      );
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.history.back()}
              className="w-full"
              variant="outline"
            >
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!eventDetails || !invitationDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">
              Invitation non trouvée
            </CardTitle>
            <CardDescription>
              Cette invitation n'existe pas ou a expiré.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date à confirmer";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Acceptée
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Déclinée
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            En attente
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Teamify</h1>
          <p className="text-muted-foreground">
            Bonjour {invitationDetails.receiverName}, vous avez été invité à un
            événement
          </p>
        </div>

        {/* Event Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {eventDetails.title}
                </CardTitle>
                <CardDescription className="text-lg">
                  Organisé par {eventDetails.organization.name}
                </CardDescription>
              </div>
              {getStatusBadge(invitationDetails.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {eventDetails.description && (
              <p className="text-foreground">{eventDetails.description}</p>
            )}

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">
                  {formatDate(eventDetails.startDate)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{eventDetails.location}</span>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">
                  Capacité : {eventDetails.capacity} personnes
                </span>
              </div>
            </div>

            {/* Response Buttons */}
            {invitationDetails.status === "PENDING" && (
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => handleResponse("ACCEPTED")}
                  disabled={responding}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  J'accepte l'invitation
                </Button>

                <Button
                  onClick={() => handleResponse("DECLINED")}
                  disabled={responding}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Je décline l'invitation
                </Button>
              </div>
            )}

            {invitationDetails.status !== "PENDING" && (
              <div className="pt-4 text-center">
                <p className="text-muted-foreground">
                  {invitationDetails.status === "ACCEPTED"
                    ? "Vous avez accepté cette invitation. Nous vous attendons !"
                    : "Vous avez décliné cette invitation. Merci pour votre réponse."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Cet événement est organisé via Teamify</p>
          <p>Si vous avez des questions, contactez l'organisateur</p>
        </div>
      </div>
    </div>
  );
}

/**
 * @param Composant de fallback pour Suspense
 *
 * Affiche un loader pendant le chargement des paramètres de recherche
 */
function JoinEventFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

/**
 * @param Page principale de réponse aux invitations
 *
 * Enveloppe le contenu dans Suspense pour gérer useSearchParams
 */
export default function JoinEventPage() {
  return (
    <Suspense fallback={<JoinEventFallback />}>
      <JoinEventContent />
    </Suspense>
  );
}
