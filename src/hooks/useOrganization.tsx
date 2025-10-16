"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useOrganizationsStore } from "@/store/organizationsStore";

export function useOrganization() {
  const { organizations, loading, error, initialized, fetchOrganizations } =
    useOrganizationsStore();

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

export const useOrganizationPermissions = () => {
  const [userRole, setUserRole] = useState<"OWNER" | "ADMIN" | "MEMBER" | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const fetchUserRole = useCallback(async (organizationPublicId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/organizations/${organizationPublicId}/role`
      );
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du rôle:", error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const canModify = useMemo(() => {
    return userRole === "OWNER" || userRole === "ADMIN";
  }, [userRole]);

  const canDelete = useMemo(() => {
    return userRole === "OWNER";
  }, [userRole]);

  const canModifyEvent = useMemo(() => {
    return userRole === "OWNER" || userRole === "ADMIN";
  }, [userRole]);

  const canDeleteEvent = useMemo(() => {
    return userRole === "OWNER";
  }, [userRole]);

  return {
    userRole,
    loading,
    fetchUserRole,
    canModify,
    canDelete,
    canModifyEvent,
    canDeleteEvent,
  };
};
