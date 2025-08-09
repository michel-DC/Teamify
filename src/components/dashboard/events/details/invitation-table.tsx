"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, UserPlus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";

interface Invitation {
  id: number;
  email: string;
  name: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  sentAt: string;
  respondedAt?: string;
}

interface InvitationTableProps {
  eventId: number;
}

export default function InvitationTable({ eventId }: InvitationTableProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Données d'invitation statiques pour la démo
  const fakeInvitations = useMemo<Invitation[]>(
    () => [
      {
        id: 1,
        email: "alice.martin@example.com",
        name: "Alice Martin",
        status: "ACCEPTED",
        sentAt: "2024-01-15T10:30:00Z",
        respondedAt: "2024-01-15T14:20:00Z",
      },
      {
        id: 2,
        email: "bob.dupont@example.com",
        name: "Bob Dupont",
        status: "PENDING",
        sentAt: "2024-01-14T09:15:00Z",
      },
      {
        id: 3,
        email: "claire.bernard@example.com",
        name: "Claire Bernard",
        status: "ACCEPTED",
        sentAt: "2024-01-13T16:45:00Z",
        respondedAt: "2024-01-14T08:30:00Z",
      },
      {
        id: 4,
        email: "david.rousseau@example.com",
        name: "David Rousseau",
        status: "DECLINED",
        sentAt: "2024-01-12T11:20:00Z",
        respondedAt: "2024-01-12T18:45:00Z",
      },
      {
        id: 5,
        email: "emma.leroy@example.com",
        name: "Emma Leroy",
        status: "PENDING",
        sentAt: "2024-01-11T13:10:00Z",
      },
      {
        id: 6,
        email: "felix.moreau@example.com",
        name: "Félix Moreau",
        status: "ACCEPTED",
        sentAt: "2024-01-10T15:30:00Z",
        respondedAt: "2024-01-11T09:15:00Z",
      },
    ],
    []
  );

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setInvitations(fakeInvitations);
      } catch (error) {
        console.error("Erreur lors du chargement des invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [eventId, fakeInvitations]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStats = () => {
    const total = invitations.length;
    const accepted = invitations.filter((i) => i.status === "ACCEPTED").length;
    const pending = invitations.filter((i) => i.status === "PENDING").length;
    const declined = invitations.filter((i) => i.status === "DECLINED").length;

    return { total, accepted, pending, declined };
  };

  const stats = getStats();

  /**
   * @param Ajoute une invitation en attente en local (démo)
   */
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    const email = inviteEmail.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setInviteError("Adresse email invalide");
      return;
    }

    setInviteSubmitting(true);
    try {
      // Ici on pourrait appeler POST /api/events/{id}/invitations
      const nextId = invitations.reduce((m, i) => Math.max(m, i.id), 0) + 1;
      const now = new Date().toISOString();
      setInvitations((prev) => [
        {
          id: nextId,
          email,
          name: email.split("@")[0],
          status: "PENDING",
          sentAt: now,
        },
        ...prev,
      ]);
      setInviteOpen(false);
      setInviteEmail("");
    } catch (err) {
      setInviteError("Une erreur est survenue. Réessayez.");
    } finally {
      setInviteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations envoyées
          </CardTitle>
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
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Inviter des participants
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
              Aucune invitation envoyée pour cet événement
            </p>
            <Button className="mt-4 gap-2" onClick={() => setInviteOpen(true)}>
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
                  <TableHead>Statut</TableHead>
                  <TableHead>Envoyée le</TableHead>
                  <TableHead>Réponse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">
                      {invitation.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invitation.email}
                    </TableCell>
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

      {/* Dialog d'invitation */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un participant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                Adresse email
              </label>
              <Input
                id="invite-email"
                type="email"
                placeholder="ex: jean.dupont@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              {inviteError && (
                <p className="text-sm text-destructive">{inviteError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setInviteOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={inviteSubmitting}>
                {inviteSubmitting ? "Envoi..." : "Envoyer l'invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
