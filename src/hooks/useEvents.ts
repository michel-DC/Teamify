"use client";

import { useEffect } from "react";
import { useEventsStore } from "@/store/eventsStore";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

/**
 * Hook principal pour gérer les événements
 */
export function useEvents() {
  const { events, loading, error, initialized, fetchEvents } = useEventsStore();
  const { activeOrganization } = useActiveOrganization();

  // Chargement automatique des événements au montage et lors du changement d'organisation
  useEffect(() => {
    if (activeOrganization && (!initialized || activeOrganization.publicId)) {
      fetchEvents(activeOrganization.publicId);
    }
  }, [activeOrganization, initialized, fetchEvents]);

  return {
    events,
    loading,
    error,
    initialized,
    fetchEvents,
  };
}

/**
 * Hook pour forcer le rechargement des événements
 */
export function useRefreshEvents() {
  const { fetchEvents } = useEventsStore();
  const { activeOrganization } = useActiveOrganization();

  const refreshEvents = () => {
    if (activeOrganization) {
      fetchEvents(activeOrganization.publicId);
    }
  };

  return { refreshEvents };
}

/**
 * Hook pour obtenir des événements filtrés ou transformés
 */
export function useFilteredEvents(filterFn?: (event: any) => boolean) {
  const { events, loading, error, initialized, fetchEvents } = useEventsStore();
  const { activeOrganization } = useActiveOrganization();

  // Chargement automatique des événements au montage
  useEffect(() => {
    if (activeOrganization && !initialized) {
      fetchEvents(activeOrganization.publicId);
    }
  }, [activeOrganization, initialized, fetchEvents]);

  // Appliquer le filtre si fourni
  const filteredEvents = filterFn ? events.filter(filterFn) : events;

  return {
    events: filteredEvents,
    loading,
    error,
    initialized,
    fetchEvents,
  };
}
