"use client";

import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export function ActiveOrganizationIndicator() {
  const { activeOrganization } = useActiveOrganization();

  if (!activeOrganization) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Organisation active :
      </span>
      <Badge variant="secondary" className="font-medium text-[#7C3AED] ">
        {activeOrganization.name}
      </Badge>
    </div>
  );
}
