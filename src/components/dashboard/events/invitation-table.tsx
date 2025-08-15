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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

interface Invitation {
  id: number;
  receiverName: string;
  receiverEmail: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  sentAt: string;
  respondedAt?: string;
  eventTitle?: string;
  eventCode?: string;
}

interface Event {
  id: string; // publicId
  title: string;
  eventCode: string;
  startDate?: string;
  location: string;
  publicId: string;
}

interface InvitationFormData {
  email: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
}

export default function InvitationTable() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InvitationFormData>({
    email: "",
    eventId: "",
    eventName: "",
    eventDate: "",
    eventLocation: "",
  });
  const { activeOrganization } = useActiveOrganization();

  /**
   * @param Récupération des événements et invitations de l'organisation
   *
   * Charge tous les événements et invitations de l'organisation
   */
  const fetchData = async () => {
    if (!activeOrganization) return;

    try {
      const [eventsResponse, invitationsResponse] = await Promise.all([
        fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        ),
        fetch("/api/dashboard/invitations"),
      ]);

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        setInvitations(invitationsData.invitations || []);
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
  }, [activeOrganization]);

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
   * @param Export des invitations en CSV
   *
   * Génère et télécharge un fichier CSV avec toutes les invitations
   */
  const handleExportCSV = () => {
    const headers = [
      "Nom",
      "Email",
      "Statut",
      "Événement",
      "Envoyée le",
      "Réponse le",
    ];

    const csvContent = [
      headers.join(","),
      ...invitations.map((invitation) =>
        [
          `"${invitation.receiverName}"`,
          `"${invitation.receiverEmail}"`,
          `"${invitation.status}"`,
          `"${invitation.eventTitle || "N/A"}"`,
          `"${new Date(invitation.sentAt).toLocaleDateString("fr-FR")}"`,
          `"${
            invitation.respondedAt
              ? new Date(invitation.respondedAt).toLocaleDateString("fr-FR")
              : "N/A"
          }"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `invitations_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export CSV téléchargé avec succès");
  };

  /**
   * @param Envoi d'une nouvelle invitation
   *
   * Envoie une invitation par email et met à jour la liste
   */
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.eventId) {
      toast.error(
        "Veuillez saisir une adresse email et sélectionner un événement"
      );
      return;
    }

    const selectedEvent = events.find((e) => e.id === formData.eventId);
    if (!selectedEvent) {
      toast.error("Événement non trouvé");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        `/api/events/${selectedEvent.eventCode}/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            eventName: selectedEvent.title,
            eventDate: selectedEvent.startDate
              ? new Date(selectedEvent.startDate).toLocaleDateString("fr-FR")
              : "",
            eventLocation: selectedEvent.location,
          }),
        }
      );

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
          eventTitle: selectedEvent.title,
          eventCode: selectedEvent.eventCode,
        },
      ]);

      // Réinitialiser le formulaire et fermer le dialog
      setFormData({
        email: "",
        eventId: "",
        eventName: "",
        eventDate: "",
        eventLocation: "",
      });
      setInviteDialogOpen(false);

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
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 hover:bg-green-100"
          >
            Acceptée
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-700 hover:bg-red-100"
          >
            Refusée
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
          >
            En attente
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const getStats = () => {
    const total = invitations.length;
    const accepted = invitations.filter(
      (inv) => inv.status === "ACCEPTED"
    ).length;
    const pending = invitations.filter(
      (inv) => inv.status === "PENDING"
    ).length;
    const declined = invitations.filter(
      (inv) => inv.status === "DECLINED"
    ).length;

    return { total, accepted, pending, declined };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations envoyées
          </CardTitle>
          <CardDescription className="mt-2">
            Cette table affiche les invitations envoyées par vous pour votre
            organisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations envoyées
          </CardTitle>
          <div className="flex items-center gap-2">
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
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              size="sm"
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Envoyer une invitation
            </Button>
          </div>
        </div>
        <CardDescription className="mt-2">
          Cette table affiche les invitations envoyées par vous pour votre
          organisation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </div>
            <div className="text-sm text-muted-foreground">Acceptées</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-muted-foreground">En attente</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.declined}
            </div>
            <div className="text-sm text-muted-foreground">Refusées</div>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Aucune invitation envoyée pour votre organisation
            </p>
            <Button
              className="mt-4 gap-2"
              onClick={() => setInviteDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Envoyer des invitations
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Envoyée le</TableHead>
                  <TableHead>Réponse le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">
                      {invitation.receiverName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invitation.receiverEmail}
                    </TableCell>
                    <TableCell>{invitation.eventTitle || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(invitation.sentAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invitation.respondedAt
                        ? formatDate(invitation.respondedAt)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Dialog d'envoi d'invitation */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une invitation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="event">Événement</Label>
              <Select
                value={formData.eventId}
                onValueChange={(value) => {
                  const selectedEvent = events.find((e) => e.id === value);
                  setFormData((prev) => ({
                    ...prev,
                    eventId: value,
                    eventName: selectedEvent?.title || "",
                    eventDate: selectedEvent?.startDate
                      ? new Date(selectedEvent.startDate).toLocaleDateString(
                          "fr-FR"
                        )
                      : "",
                    eventLocation: selectedEvent?.location || "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un événement" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? "Envoi en cours..." : "Envoyer l'invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
