"use client";

import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ActiveOrganizationIndicator() {
  const { activeOrganization } = useActiveOrganization();
  const router = useRouter();

  if (!activeOrganization) {
    return null;
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue dans votre espace de gestion pour{" "}
            <span className="font-bold text-[#7C3AED]">
              {activeOrganization.name}
            </span>
          </p>
        </div>
        <Button
          size="sm"
          className="hidden sm:flex mb-3 bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 shadow-lg p-2"
          onClick={() => {
            const url = activeOrganization
              ? `/dashboard/events/new?orgId=${activeOrganization.id}`
              : "/dashboard/events/new";
            router.push(url);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Créer un nouvel événement
        </Button>
      </div>
    </div>
  );
}
