"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Crown, Shield } from "lucide-react";

interface GroupMembersListProps {
  members: Array<{
    id: string;
    userId: string;
    role: "MEMBER" | "ADMIN";
    joinedAt: Date;
    user: {
      uid: string;
      firstname: string | null;
      lastname: string | null;
      profileImage: string | null;
    };
  }>;
  currentUserId?: string;
}

/**
 * Composant pour afficher la liste des membres de la conversation de groupe
 */
export const GroupMembersList = ({
  members,
  currentUserId,
}: GroupMembersListProps) => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Obtenir le nom d'affichage d'un membre
   */
  const getMemberDisplayName = (member: any) => {
    const firstname = member.user.firstname || "";
    const lastname = member.user.lastname || "";
    return `${firstname} ${lastname}`.trim() || "Utilisateur";
  };

  /**
   * Obtenir les initiales d'un membre
   */
  const getMemberInitials = (member: any) => {
    const firstname = member.user.firstname || "";
    const lastname = member.user.lastname || "";
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  };

  /**
   * Obtenir l'icône du rôle
   */
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  /**
   * Obtenir la couleur du badge de rôle
   */
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Users className="h-4 w-4 mr-1" />
          {members.length}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membres du groupe ({members.length})
          </DialogTitle>
          <DialogDescription>
            Tous les membres de votre organisation peuvent participer à cette
            conversation.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  member.userId === currentUserId ? "bg-muted/50" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.profileImage || undefined} />
                  <AvatarFallback>{getMemberInitials(member)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {getMemberDisplayName(member)}
                    </p>
                    {member.userId === currentUserId && (
                      <Badge variant="outline" className="text-xs">
                        Vous
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={getRoleBadgeVariant(member.role)}
                      className="text-xs flex items-center gap-1"
                    >
                      {getRoleIcon(member.role)}
                      {member.role === "ADMIN" ? "Administrateur" : "Membre"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Rejoint le{" "}
                      {new Date(member.joinedAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
