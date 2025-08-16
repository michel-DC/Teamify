"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

/**
 * @param Hook pour gérer les permissions d'un utilisateur dans une organisation
 *
 * Fournit des fonctions pour vérifier les rôles et permissions d'un utilisateur
 */
export const useOrganizationPermissions = () => {
  const [userRole, setUserRole] = useState<"OWNER" | "ADMIN" | "MEMBER" | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  /**
   * @param Récupère le rôle de l'utilisateur dans une organisation
   */
  const fetchUserRole = useCallback(async (organizationId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/organizations/${organizationId}/role`
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

  /**
   * @param Vérifie si l'utilisateur peut modifier une organisation
   */
  const canModify = useMemo(() => {
    return userRole === "OWNER" || userRole === "ADMIN";
  }, [userRole]);

  /**
   * @param Vérifie si l'utilisateur peut supprimer une organisation
   */
  const canDelete = useMemo(() => {
    return userRole === "OWNER";
  }, [userRole]);

  /**
   * @param Vérifie si l'utilisateur peut modifier un événement
   */
  const canModifyEvent = useMemo(() => {
    return userRole === "OWNER" || userRole === "ADMIN";
  }, [userRole]);

  /**
   * @param Vérifie si l'utilisateur peut supprimer un événement
   */
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
