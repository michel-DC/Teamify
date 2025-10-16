import { useEffect } from "react";
import { useSidebarStore } from "@/store/sidebarStore";

export function useSidebarData() {
  const { data, loading, initialized, fetchSidebarData } = useSidebarStore();

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

export function useRefreshSidebarData() {
  const { fetchSidebarData, resetStore } = useSidebarStore();

  const refreshData = () => {
    resetStore();
    fetchSidebarData();
  };

  return { refreshData };
}
