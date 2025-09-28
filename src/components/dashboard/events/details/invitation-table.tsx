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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, UserPlus, Users, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import Image from "next/image";

interface Invitation {
  id: number;
  receiverName: string;
  receiverEmail: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  sentAt: string;
  respondedAt?: string | null;
}

interface InvitationTableProps {
  eventId: number;
  eventSlug?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}

export default function InvitationTable({
  eventId,
  eventSlug,
  eventName = "Événement",
  eventDate,
  eventLocation,
}: InvitationTableProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  /**
   * @param Récupération des invitations depuis l'API
   *
   * Charge les invitations réelles depuis la base de données
   */
  const fetchInvitations = async () => {
    if (!eventSlug) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/events/${eventSlug}/invitations`
      );

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      } else {
        console.error("Erreur lors du chargement des invitations");
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
    setLoading(true);
    fetchInvitations();
  }, [eventSlug]);

  /**
   * @param Rafraîchissement de la liste des invitations
   *
   * Recharge les données depuis l'API
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInvitations();
    toast.success("Liste des invitations mise à jour 👏​");
  };

  /**
   * @param Calcul de la pagination
   *
   * Calcule les indices de début et fin pour la page courante
   */
  const paginatedInvitations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return invitations.slice(startIndex, endIndex);
  }, [invitations, currentPage]);

  const totalPages = Math.ceil(invitations.length / itemsPerPage);

  /**
   * @param Génération des numéros de page à afficher
   *
   * Affiche les pages autour de la page courante avec des ellipsis si nécessaire
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Si moins de 5 pages, afficher toutes
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sinon, afficher les pages autour de la page courante
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("ellipsis-start");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("ellipsis-end");
        pages.push(totalPages);
      }
    }

    return pages;
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
   * @param Envoi d'une invitation par email via l'API
   *
   * Valide l'email et envoie l'invitation via l'API
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

    if (!eventSlug) {
      setInviteError(
        "Impossible d'envoyer l'invitation : slug d'événement manquant"
      );
      return;
    }

    setInviteSubmitting(true);
    try {
      // Appel de l'API pour envoyer l'email
      const response = await fetch(`/api/events/${eventSlug}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          eventName,
          eventDate,
          eventLocation,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors de l'envoi de l'invitation"
        );
      }

      // Ajout de l'invitation en local après envoi réussi
      const newInvitation: Invitation = {
        id: Date.now(), // ID temporaire
        receiverName: email.split("@")[0],
        receiverEmail: email,
        status: "PENDING",
        sentAt: new Date().toISOString(),
        respondedAt: null,
      };

      setInvitations((prev) => [newInvitation, ...prev]);

      setInviteOpen(false);
      setInviteEmail("");
      // Retourner à la première page après ajout
      setCurrentPage(1);

      // Notification de succès
      toast.success(`Invitation envoyée avec succès à ${email} 😜​`, {
        description:
          "L'email a été envoyé et l'invitation est en attente de réponse.",
      });
    } catch (err) {
      console.error("Erreur envoi invitation:", err);
      setInviteError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Réessayez."
      );
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
          <CardDescription className="mt-2">
            Cette table affiche les invitations envoyées par vous pour cet
            événement.
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span className="text-lg sm:text-xl">Invitations envoyées</span>
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {refreshing ? "Actualisation..." : "Actualiser"}
              </span>
              <span className="sm:hidden">
                {refreshing ? "..." : "Actualiser"}
              </span>
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-[#7C3AED] hover:bg-[#c1a3f4] text-white w-full sm:w-auto"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Inviter des participants</span>
              <span className="sm:hidden">Inviter</span>
            </Button>
          </div>
        </div>
        <CardDescription className="mt-2">
          Cette table affiche les invitations envoyées par vous pour cet
          événement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {stats.total}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Total
            </div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {stats.accepted}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Acceptées
            </div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              En attente
            </div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {stats.declined}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Refusées
            </div>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Image
              src="/images/illustration/no-invitation-send.svg"
              alt="Aucune invitation envoyée"
              width={100}
              height={100}
              className="mx-auto"
            />
            <p className="text-muted-foreground">
              Aucune invitation envoyée pour cet événement
            </p>
            <Button
              className="mt-4 gap-2 bg-[#7C3AED] hover:bg-[#c1a3f4] text-white"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Envoyer des invitations
            </Button>
          </div>
        ) : (
          <>
            {/* Version mobile - Cards */}
            <div className="block sm:hidden space-y-3">
              {paginatedInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">
                      {invitation.receiverName}
                    </div>
                    {getStatusBadge(invitation.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {invitation.receiverEmail}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Envoyée:</strong> {formatDate(invitation.sentAt)}
                  </div>
                  {invitation.respondedAt && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Réponse:</strong>{" "}
                      {formatDate(invitation.respondedAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Version desktop - Table */}
            <div className="hidden sm:block rounded-md border">
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
                  {paginatedInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        {invitation.receiverName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invitation.receiverEmail}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center sm:justify-end mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "ellipsis-start" ||
                        page === "ellipsis-end" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page as number);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            setCurrentPage(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Dialog d'invitation */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
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
                className="w-full"
              />
              {inviteError && (
                <p className="text-sm text-destructive">{inviteError}</p>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setInviteOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={inviteSubmitting}
                className="bg-[#7C3AED] hover:bg-[#c1a3f4] text-white w-full sm:w-auto order-1 sm:order-2"
              >
                {inviteSubmitting ? "Envoi..." : "Envoyer l'invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
