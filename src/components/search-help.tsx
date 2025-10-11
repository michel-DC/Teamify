"use client";

import { Command, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Composant d'aide pour expliquer le raccourci de recherche
 * Affiche un bouton avec tooltip expliquant Ctrl+K
 */
export function SearchHelp() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <Command className="h-3 w-3" />
            <span className="text-xs">K</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appuyez sur Ctrl+K pour rechercher</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
