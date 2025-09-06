"use client";

import { useState, useEffect, useCallback } from "react";

const SIDEBAR_STORAGE_KEY = "isSidebarCollapsed";
const USER_SIDEBAR_PREFERENCE_KEY = "userSidebarPreference";

type SidebarPreference = "auto" | "always-collapsed";

/**
 * Hook personnalisé pour gérer l'état de la sidebar avec persistance en localStorage
 *
 * @returns {Object} Objet contenant l'état de la sidebar et les fonctions pour le modifier
 */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Fonction pour récupérer l'état depuis localStorage
  const getStoredState = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    try {
      // Vérifier d'abord les préférences utilisateur
      const userPreference = localStorage.getItem(USER_SIDEBAR_PREFERENCE_KEY);
      if (userPreference === "always-collapsed") {
        return true; // Toujours fermé
      }

      // Sinon, utiliser l'état normal
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn("Erreur lors de la lecture de l'état de la sidebar:", error);
      return false;
    }
  }, []);

  // Fonction pour sauvegarder l'état dans localStorage
  const setStoredState = useCallback((collapsed: boolean) => {
    if (typeof window === "undefined") return;

    try {
      // Ne sauvegarder que si l'utilisateur n'a pas de préférence "always-collapsed"
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

  // Initialiser l'état depuis localStorage au montage du composant
  useEffect(() => {
    const storedState = getStoredState();
    setIsCollapsed(storedState);
    setIsInitialized(true);
  }, [getStoredState]);

  // Fonction pour basculer l'état de la sidebar
  const toggleSidebar = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setStoredState(newState);
  }, [isCollapsed, setStoredState]);

  // Fonction pour définir explicitement l'état de la sidebar
  const setSidebarState = useCallback(
    (collapsed: boolean) => {
      setIsCollapsed(collapsed);
      setStoredState(collapsed);
    },
    [setStoredState]
  );

  // Fonction pour obtenir l'état sous forme de string (compatible avec le système existant)
  const getSidebarState = useCallback((): "expanded" | "collapsed" => {
    return isCollapsed ? "collapsed" : "expanded";
  }, [isCollapsed]);

  // Fonction pour obtenir l'état sous forme de boolean (inverse de isCollapsed pour compatibilité)
  const isOpen = useCallback((): boolean => {
    return !isCollapsed;
  }, [isCollapsed]);

  // Fonction pour obtenir les préférences utilisateur
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

  // Fonction pour définir les préférences utilisateur
  const setUserPreference = useCallback(
    (preference: SidebarPreference) => {
      if (typeof window === "undefined") return;

      try {
        if (preference === "auto") {
          localStorage.removeItem(USER_SIDEBAR_PREFERENCE_KEY);
        } else {
          localStorage.setItem(USER_SIDEBAR_PREFERENCE_KEY, preference);
          // Supprimer l'ancien système de persistance
          localStorage.removeItem(SIDEBAR_STORAGE_KEY);
        }

        // Recharger l'état
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
