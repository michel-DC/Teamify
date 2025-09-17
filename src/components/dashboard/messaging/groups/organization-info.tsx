"use client";

import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useAutoSignedImage } from "@/hooks/useAutoSignedImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Building2 } from "lucide-react";

/**
 * Composant pour afficher les informations de l'organisation dans la sidebar
 */
export const OrganizationInfo = () => {
  const { activeOrganization } = useActiveOrganization();
  const { signedUrl } = useAutoSignedImage(
    activeOrganization?.profileImage || null
  );

  if (!activeOrganization) {
    return null;
  }

  return (
    <div className="p-3 border-b bg-muted/30">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={signedUrl || undefined} />
          <AvatarFallback>
            <Building2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {activeOrganization.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{activeOrganization.memberCount} membres</span>
            <Badge variant="secondary" className="text-xs">
              {activeOrganization.organizationType}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
