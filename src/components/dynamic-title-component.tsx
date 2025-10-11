"use client";

import { useEffect } from "react";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

/**
 * Composant pour gérer le titre dynamique de la page
 * Met à jour le titre du document avec le format : "Tableau de bord • {nom organisation}"
 * Utilise document.title pour forcer la mise à jour du titre côté client
 */
export function DynamicTitleComponent() {
  const { activeOrganization } = useActiveOrganization();

  useEffect(() => {
    const getTitle = () => {
      if (activeOrganization?.name) {
        return `Tableau de bord • ${
          activeOrganization.name.charAt(0).toLowerCase() +
          activeOrganization.name.slice(1)
        }`;
      }
      return "Tableau de bord • Teamify";
    };

    // Mettre à jour le titre du document
    document.title = getTitle();
  }, [activeOrganization]);

  // Ce composant ne rend rien visuellement
  return null;
}
