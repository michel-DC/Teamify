"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";
import { useOrganizationsStore } from "@/store/organizationsStore";
import { useEventsStore } from "@/store/eventsStore";
import { useActiveOrganizationStore } from "@/store/activeOrganizationStore";

interface DataPersistenceOptions {
  requiredPathSegment?: string;
  clearAuthCookies?: boolean;
  debug?: boolean;
  enabled?: boolean;
}

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

  const clearPersistedData = useCallback(() => {
    resetSidebar();
    resetOrganizations();
    resetEvents();
    clearActiveOrganization();

    try {
      const keysToRemove = [
        "sidebar-storage",
        "organizations-storage",
        "events-storage",
        "active-organization-storage",
      ];

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

    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn(
        "[DataPersistence] Erreur lors du vidage de la sessionStorage:",
        error
      );
    }

    try {
      const cookiesToRemove = [
        "sidebar-data",
        "organizations-data",
        "events-data",
        "user-preferences",
      ];

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
