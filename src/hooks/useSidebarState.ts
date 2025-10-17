"use client";

import { useState, useEffect, useCallback } from "react";

const SIDEBAR_STORAGE_KEY = "isSidebarCollapsed";
const USER_SIDEBAR_PREFERENCE_KEY = "userSidebarPreference";

type SidebarPreference = "auto" | "always-collapsed";

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const getStoredState = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    try {
      const userPreference = localStorage.getItem(USER_SIDEBAR_PREFERENCE_KEY);
      if (userPreference === "always-collapsed") {
        return true; 
      }

      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn("Erreur lors de la lecture de l'état de la sidebar:", error);
      return false;
    }
  }, []);

  const setStoredState = useCallback((collapsed: boolean) => {
    if (typeof window === "undefined") return;

    try {
      const userPreference = localStorage.getItem(USER_SIDEBAR_PREFERENCE_KEY);
      if (userPreference !== "always-collapsed") {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(collapsed));
      }
    } catch (error) {
      console.warn(
        "Erreur lors de la sauvegarde de l'état de la sidebar:",
        error
      );
    }
  }, []);

  useEffect(() => {
    const storedState = getStoredState();
    setIsCollapsed(storedState);
    setIsInitialized(true);
  }, [getStoredState]);

  const toggleSidebar = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setStoredState(newState);
  }, [isCollapsed, setStoredState]);

  const setSidebarState = useCallback(
    (collapsed: boolean) => {
      setIsCollapsed(collapsed);
      setStoredState(collapsed);
    },
    [setStoredState]
  );

  const getSidebarState = useCallback((): "expanded" | "collapsed" => {
    return isCollapsed ? "collapsed" : "expanded";
  }, [isCollapsed]);

  const isOpen = useCallback((): boolean => {
    return !isCollapsed;
  }, [isCollapsed]);

  const getUserPreference = useCallback((): SidebarPreference => {
    if (typeof window === "undefined") return "auto";

    try {
      const stored = localStorage.getItem(USER_SIDEBAR_PREFERENCE_KEY);
      return (stored as SidebarPreference) || "auto";
    } catch (error) {
      console.warn("Erreur lors de la lecture des préférences:", error);
      return "auto";
    }
  }, []);

  const setUserPreference = useCallback(
    (preference: SidebarPreference) => {
      if (typeof window === "undefined") return;

      try {
        if (preference === "auto") {
          localStorage.removeItem(USER_SIDEBAR_PREFERENCE_KEY);
        } else {
          localStorage.setItem(USER_SIDEBAR_PREFERENCE_KEY, preference);
          localStorage.removeItem(SIDEBAR_STORAGE_KEY);
        }

        const newState = getStoredState();
        setIsCollapsed(newState);
      } catch (error) {
        console.warn("Erreur lors de la sauvegarde des préférences:", error);
      }
    },
    [getStoredState]
  );

  return {
    // État
    isCollapsed,
    isOpen: isOpen(),
    state: getSidebarState(),
    isInitialized,
    userPreference: getUserPreference(),

    // Actions
    toggleSidebar,
    setSidebarState,
    setCollapsed: (collapsed: boolean) => setSidebarState(collapsed),
    setExpanded: (expanded: boolean) => setSidebarState(!expanded),
    setUserPreference,
  };
}
