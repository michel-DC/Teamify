"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Invitation {
  id: number;
  receiverName: string;
  receiverEmail: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  sentAt: string;
  respondedAt?: string;
}

interface EventDetails {
  id: number;
  title: string;
  eventCode: string;
  startDate?: string;
  location: string;
}

interface InvitationFormData {
  email: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
}

export default function InvitationTable({ eventSlug }: { eventSlug: string }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<InvitationFormData>({
    email: "",
    eventName: "",
    eventDate: "",
    eventLocation: "",
  });

  /**
   * @param Récupération des détails de l'événement et des invitations
   *
   * Charge les informations de l'événement et la liste des invitations
   */
  const fetchData = async () => {
    try {
      const [eventResponse, invitationsResponse] = await Promise.all([
        fetch(`/api/dashboard/events/${eventSlug}`),
        fetch(`/api/dashboard/events/${eventSlug}/invitations`),
      ]);

      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEventDetails(eventData);
        setFormData((prev) => ({
          ...prev,
          eventName: eventData.title,
          eventDate: eventData.startDate
            ? new Date(eventData.startDate).toLocaleDateString("fr-FR")
            : "",
          eventLocation: eventData.location,
        }));
      }

      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        setInvitations(invitationsData.invitations);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventSlug]);

  /**
   * @param Rafraîchissement de la liste des invitations
   *
   * Recharge les données depuis l'API
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success("Liste des invitations mise à jour");
  };

  /**
   * @param Envoi d'une nouvelle invitation
   *
   * Envoie une invitation par email et met à jour la liste
   */
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Veuillez saisir une adresse email");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/events/${eventSlug}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi");
      }

      const data = await response.json();

      // Ajouter la nouvelle invitation à la liste
      setInvitations((prev) => [
        ...prev,
        {
          id: data.invitation.id,
          receiverName: data.invitation.receiverName,
          receiverEmail: data.invitation.receiverEmail,
          status: "PENDING",
          sentAt: new Date().toISOString(),
        },
      ]);

      // Réinitialiser le formulaire
      setFormData((prev) => ({ ...prev, email: "" }));

      toast.success("Invitation envoyée avec succès !");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'envoi"
      );
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge className="bg-green-100 text-green-800">Acceptée</Badge>;
      case "DECLINED":
        return <Badge className="bg-red-100 text-red-800">Déclinée</Badge>;
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "DECLINED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulaire d'envoi d'invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envoyer une invitation
          </CardTitle>
          <CardDescription>
            Invitez quelqu'un à participer à votre événement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <Button type="submit" disabled={sending} className="w-full">
              {sending ? "Envoi en cours..." : "Envoyer l'invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{invitations.length}</p>
                <p className="text-sm text-gray-600">Total invitations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {
                    invitations.filter((inv) => inv.status === "ACCEPTED")
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">Acceptées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {invitations.filter((inv) => inv.status === "PENDING").length}
                </p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des invitations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invitations envoyées</CardTitle>
              <CardDescription>
                Suivez l'état de vos invitations
              </CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Actualisation..." : "Actualiser"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune invitation envoyée pour le moment</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invité</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Envoyée le</TableHead>
                  <TableHead>Réponse le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {invitation.receiverName}
                      </div>
                    </TableCell>
                    <TableCell>{invitation.receiverEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invitation.status)}
                        {getStatusBadge(invitation.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(invitation.sentAt)}</TableCell>
                    <TableCell>
                      {invitation.respondedAt
                        ? formatDate(invitation.respondedAt)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
