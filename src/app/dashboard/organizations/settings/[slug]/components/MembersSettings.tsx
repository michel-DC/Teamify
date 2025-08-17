"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Crown, Shield, User } from "lucide-react";

interface OrganizationMember {
  id: number;
  userUid: string;
  organizationId: number;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  user: {
    uid: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
  };
}

interface MembersSettingsProps {
  organizationId: number;
  organizationPublicId: string;
  userRole: "OWNER" | "ADMIN" | "MEMBER" | null;
}

const roleLabels = {
  OWNER: {
    label: "Propriétaire",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: Crown,
  },
  ADMIN: {
    label: "Administrateur",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: Shield,
  },
  MEMBER: {
    label: "Membre",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    icon: User,
  },
};

export function MembersSettings({
  organizationId,
  organizationPublicId,
  userRole,
}: MembersSettingsProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(
    null
  );

  /**
   * Récupération des membres de l'organisation
   */
  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/organizations/by-public-id/${organizationPublicId}/members`
      );
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        console.error("Erreur lors de la récupération des membres");
        toast.error("Erreur lors de la récupération des membres");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des membres:", error);
      toast.error("Erreur lors de la récupération des membres");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Modification du rôle d'un membre
   */
  const handleRoleChange = async (memberId: number, newRole: string) => {
    setRoleChangeLoading(memberId.toString());
    try {
      // Utiliser la nouvelle route API pour les paramètres
      const response = await fetch(
        `/api/organizations/settings/${organizationPublicId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        toast.success("Rôle mis à jour avec succès");
        fetchMembers(); // Recharger la liste
      } else {
        const errorData = await response.json();
        console.error("Erreur API:", errorData);
        toast.error(
          errorData.error || "Erreur lors de la modification du rôle"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la modification du rôle:", error);
      toast.error("Erreur lors de la modification du rôle");
    } finally {
      setRoleChangeLoading(null);
    }
  };

  /**
   * Suppression d'un membre
   */
  const handleRemoveMember = async (memberId: number) => {
    try {
      // Utiliser la nouvelle route API pour les paramètres
      const response = await fetch(
        `/api/organizations/settings/${organizationPublicId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Membre supprimé avec succès");
        fetchMembers(); // Recharger la liste
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  /**
   * Filtrage des membres par recherche
   */
  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${member.user?.firstname || ""} ${
      member.user?.lastname || ""
    }`.toLowerCase();
    const email = member.user?.email?.toLowerCase() || "";

    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  /**
   * Vérification des permissions
   */
  const canModifyRoles = userRole === "OWNER";
  const canRemoveMembers = userRole === "OWNER" || userRole === "ADMIN";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement des membres...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des membres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold">{members.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total des membres
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold">
                  {members.filter((m) => m.role === "ADMIN").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Administrateurs
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold">
                  {members.filter((m) => m.role === "MEMBER").length}
                </div>
                <div className="text-sm text-muted-foreground">Membres</div>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table des membres */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    {canModifyRoles && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const roleInfo = roleLabels[member.role];
                    const RoleIcon = roleInfo.icon;
                    const fullName =
                      `${member.user?.firstname || ""} ${
                        member.user?.lastname || ""
                      }`.trim() || "Utilisateur";
                    const initials = fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{fullName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.user?.email || "Email non disponible"}
                        </TableCell>
                        <TableCell>
                          <Badge className={roleInfo.color}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </TableCell>
                        {canModifyRoles && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.role !== "OWNER" && (
                                <>
                                  <Select
                                    value={member.role}
                                    onValueChange={(value) =>
                                      handleRoleChange(member.id, value)
                                    }
                                    disabled={
                                      roleChangeLoading === member.id.toString()
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MEMBER">
                                        Membre
                                      </SelectItem>
                                      <SelectItem value="ADMIN">
                                        Admin
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {canRemoveMembers && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveMember(member.id)
                                      }
                                      disabled={
                                        roleChangeLoading ===
                                        member.id.toString()
                                      }
                                    >
                                      Retirer
                                    </Button>
                                  )}
                                </>
                              )}
                              {member.role === "OWNER" && (
                                <span className="text-sm text-muted-foreground">
                                  Propriétaire
                                </span>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Aucun membre trouvé"
                    : "Aucun membre dans cette organisation"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
