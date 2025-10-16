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

  useEffect(() => {
    if (initialized && organizations.length > 0 && !activeOrganization) {
      setActiveOrganization(organizations[0]);
    }
  }, [initialized, organizations, activeOrganization, setActiveOrganization]);

  useEffect(() => {
    if (activeOrganization && organizations.length > 0) {
      const organizationExists = organizations.some(
        (org) => org.id === activeOrganization.id
      );

      if (!organizationExists) {
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
