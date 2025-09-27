"use client";

import { Button } from "@/components/ui/button";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function SiteHeader() {
  const { activeOrganization } = useActiveOrganization();
  const router = useRouter();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">Tableau de bord</h1>
        <div className="ml-auto flex items-center gap-2">
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
    </header>
  );
}
