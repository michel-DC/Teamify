"use client";

import { useEffect } from "react";
import { useActiveOrganizationStore } from "@/store/activeOrganizationStore";
import { useOrganizationsStore } from "@/store/organizationsStore";

export function useActiveOrganization() {
  const {
    activeOrganization,
    loading,
    error,
    setActiveOrganization,
    clearActiveOrganization,
    setLoading,
    setError,
  } = useActiveOrganizationStore();

  const { organizations, initialized } = useOrganizationsStore();

  /**
   * Initialise automatiquement l'organisation active si aucune n'est sélectionnée
   */
  useEffect(() => {
    if (initialized && organizations.length > 0 && !activeOrganization) {
      // Sélectionner la première organisation par défaut
      setActiveOrganization(organizations[0]);
    }
  }, [initialized, organizations, activeOrganization, setActiveOrganization]);

  /**
   * Met à jour l'organisation active si elle n'existe plus dans la liste
   */
  useEffect(() => {
    if (activeOrganization && organizations.length > 0) {
      const organizationExists = organizations.some(
        (org) => org.id === activeOrganization.id
      );

      if (!organizationExists) {
        // L'organisation active n'existe plus, sélectionner la première disponible
        setActiveOrganization(organizations[0]);
      }
    }
  }, [organizations, activeOrganization, setActiveOrganization]);

  return {
    activeOrganization,
    loading,
    error,
    setActiveOrganization,
    clearActiveOrganization,
    setLoading,
    setError,
  };
}
