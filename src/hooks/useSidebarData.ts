import { useEffect } from "react";
import { useSidebarStore } from "@/store/sidebarStore";

/**
 * Hook personnalisé pour gérer les données de la sidebar
 * Gère automatiquement le chargement des données et évite les refetch inutiles
 */
export function useSidebarData() {
  const { data, loading, initialized, fetchSidebarData } = useSidebarStore();

  // Chargement automatique des données au montage
  useEffect(() => {
    if (!initialized) {
      fetchSidebarData();
    }
  }, [initialized, fetchSidebarData]);

  return {
    data,
    loading,
    initialized,
    fetchSidebarData,
  };
}

/**
 * Hook pour forcer le rafraîchissement des données de la sidebar
 * Utile après des actions qui modifient les données (création d'événement, etc.)
 */
export function useRefreshSidebarData() {
  const { fetchSidebarData, resetStore } = useSidebarStore();

  const refreshData = () => {
    resetStore();
    fetchSidebarData();
  };

  return { refreshData };
}
