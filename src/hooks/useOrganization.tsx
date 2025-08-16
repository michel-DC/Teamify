"use client";

import { useEffect } from "react";
import { useOrganizationsStore } from "@/store/organizationsStore";

export function useOrganization() {
  const { organizations, loading, error, initialized, fetchOrganizations } =
    useOrganizationsStore();

  // Chargement automatique des organisations au montage
  useEffect(() => {
    if (!initialized) {
      fetchOrganizations();
    }
  }, [initialized, fetchOrganizations]);

  return {
    organizations,
    loading,
    error,
    initialized,
  };
}
