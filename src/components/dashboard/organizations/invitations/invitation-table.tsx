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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Invitation {
  id: number;
  inviteCode: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  invitedBy: {
    firstname: string | null;
    lastname: string | null;
    email: string;
  };
}

interface InvitationFormData {
  email: string;
}

interface InvitationTableProps {
  organizationId: string;
  organizationName: string;
}

/**
 * Composant pour afficher et gérer les invitations d'une organisation
 * Permet d'envoyer de nouvelles invitations et d'afficher l'historique
 */
export default function InvitationTable({
  organizationId,
  organizationName,
}: InvitationTableProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InvitationFormData>({
    email: "",
  });

  /**
   * @param Récupération des invitations de l'organisation
   *
   * Charge toutes les invitations de l'organisation
   */
  const fetchInvitations = async () => {
    try {
      const response = await fetch(
        `/api/organizations/by-public-id/${organizationId}/invitations`
      );
      const data = await response.json();

      if (data.success) {
        setInvitations(data.invitations || []);
      } else {
        toast.error("Erreur lors du chargement des invitations");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des invitations:", error);
      toast.error("Erreur lors du chargement des invitations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [organizationId]);

  /**
   * @param Rafraîchissement de la liste des invitations
   *
   * Recharge les données depuis l'API
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInvitations();
    toast.success("Liste des invitations mise à jour");
  };

  /**
   * @param Export des invitations en CSV
   *
   * Génère et télécharge un fichier CSV avec toutes les invitations
   */
  const handleExportCSV = () => {
    const headers = [
      "Email",
      "Statut",
      "Code d'invitation",
      "Invitée par",
      "Envoyée le",
    ];

    const csvContent = [
      headers.join(","),
      ...invitations.map((invitation) =>
        [
          `"${invitation.email}"`,
          `"${invitation.status}"`,
          `"${invitation.inviteCode}"`,
          `"${invitation.invitedBy.firstname} ${invitation.invitedBy.lastname}"`,
          `"${new Date(invitation.createdAt).toLocaleDateString("fr-FR")}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `invitations_organisation_${new Date().toISOString().split("T")[0]}.csv`
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

    if (!formData.email.trim()) {
      toast.error("Veuillez saisir une adresse email");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/organizations/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationPublicId: organizationId,
          email: formData.email.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi");
      }

      const data = await response.json();

      if (data.success) {
        // Recharger la liste des invitations
        await fetchInvitations();

        // Réinitialiser le formulaire et fermer le dialog
        setFormData({ email: "" });
        setInviteDialogOpen(false);

        toast.success("Invitation envoyée avec succès !");
      } else {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }
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
            Cette table affiche les invitations envoyées pour rejoindre votre
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
          Cette table affiche les invitations envoyées pour rejoindre votre
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
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Code d'invitation</TableHead>
                  <TableHead>Invitée par</TableHead>
                  <TableHead>Envoyée le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">
                      {invitation.email}
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {invitation.status === "PENDING"
                        ? invitation.inviteCode
                        : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invitation.invitedBy.firstname}{" "}
                      {invitation.invitedBy.lastname}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(invitation.createdAt)}
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
