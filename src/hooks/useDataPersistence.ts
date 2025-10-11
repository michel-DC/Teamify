"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";
import { useOrganizationsStore } from "@/store/organizationsStore";
import { useEventsStore } from "@/store/eventsStore";
import { useActiveOrganizationStore } from "@/store/activeOrganizationStore";

interface DataPersistenceOptions {
  /**
   * @param Chaîne de caractères à rechercher dans l'URL pour déterminer si les données doivent être conservées
   */
  requiredPathSegment?: string;
  /**
   * @param Si true, vide également les cookies d'authentification
   */
  clearAuthCookies?: boolean;
  /**
   * @param Si true, affiche des logs de débogage
   */
  debug?: boolean;
  /**
   * @param Si false, désactive complètement la fonctionnalité
   */
  enabled?: boolean;
}

/**
 * @param Hook de gestion de la persistance des données
 *
 * Gère automatiquement le vidage des données persistées
 * selon la présence d'un segment d'URL spécifique
 */
export function useDataPersistence(options: DataPersistenceOptions = {}) {
  const {
    requiredPathSegment = "dashboard",
    clearAuthCookies = false,
    debug = false,
    enabled = true,
  } = options;

  const pathname = usePathname();
  const { resetStore: resetSidebar } = useSidebarStore();
  const { resetStore: resetOrganizations } = useOrganizationsStore();
  const { resetStore: resetEvents } = useEventsStore();
  const { clearActiveOrganization } = useActiveOrganizationStore();

  /**
   * @param Fonction de vidage des données persistées
   *
   * Vide tous les stores Zustand, localStorage, sessionStorage et cookies
   */
  const clearPersistedData = useCallback(() => {
    // Vidage des stores Zustand
    resetSidebar();
    resetOrganizations();
    resetEvents();
    clearActiveOrganization();

    // Vidage du localStorage
    try {
      const keysToRemove = [
        "sidebar-storage",
        "organizations-storage",
        "events-storage",
        "active-organization-storage",
      ];

      // Ajouter les clés d'authentification seulement si demandé
      if (clearAuthCookies) {
        keysToRemove.push("isLoggedIn", "hasOrganization", "token");
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn(
        "[DataPersistence] Erreur lors du vidage du localStorage:",
        error
      );
    }

    // Vidage de la sessionStorage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn(
        "[DataPersistence] Erreur lors du vidage de la sessionStorage:",
        error
      );
    }

    // Vidage des cookies
    try {
      const cookiesToRemove = [
        "sidebar-data",
        "organizations-data",
        "events-data",
        "user-preferences",
      ];

      // Ajouter les cookies d'authentification seulement si demandé
      if (clearAuthCookies) {
        cookiesToRemove.push("token", "isLoggedIn", "hasOrganization");
      }

      cookiesToRemove.forEach((cookieName) => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
    } catch (error) {
      console.warn(
        "[DataPersistence] Erreur lors du vidage des cookies:",
        error
      );
    }
  }, [
    resetSidebar,
    resetOrganizations,
    resetEvents,
    clearActiveOrganization,
    clearAuthCookies,
  ]);

  useEffect(() => {
    /**
     * @param Vérification de la présence du segment requis dans l'URL
     *
     * Si le segment n'est pas présent, vide toutes les données persistées
     */
    // Ne rien faire si la fonctionnalité est désactivée
    if (!enabled) {
      return;
    }

    const hasRequiredSegment = pathname.includes(requiredPathSegment);

    if (!hasRequiredSegment) {
      clearPersistedData();
    }
  }, [pathname, requiredPathSegment, clearPersistedData, enabled]);

  return {
    clearPersistedData,
    isInRequiredSection: pathname.includes(requiredPathSegment),
    currentPath: pathname,
  };
}
