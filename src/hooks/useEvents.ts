import { useEffect } from "react";
import { useEventsStore } from "@/store/eventsStore";
import type { Event } from "@/store/eventsStore";

/**
 * Hook personnalisé pour gérer les événements
 * Gère automatiquement le chargement des données et évite les refetch inutiles
 */
export function useEvents() {
  const { events, loading, error, initialized, fetchEvents } = useEventsStore();

  // Chargement automatique des événements au montage
  useEffect(() => {
    if (!initialized) {
      fetchEvents();
    }
  }, [initialized, fetchEvents]);

  return {
    events,
    loading,
    error,
    initialized,
    fetchEvents,
  };
}

/**
 * Hook pour forcer le rafraîchissement des événements
 * Utile après des actions qui modifient les événements
 */
export function useRefreshEvents() {
  const { fetchEvents, resetStore } = useEventsStore();

  const refreshEvents = () => {
    resetStore();
    fetchEvents();
  };

  return { refreshEvents };
}

/**
 * Hook pour obtenir des événements filtrés ou transformés
 */
export function useFilteredEvents(filterFn?: (event: Event) => boolean) {
  const { events, loading, error, initialized, fetchEvents } = useEventsStore();

  // Chargement automatique des événements au montage
  useEffect(() => {
    if (!initialized) {
      fetchEvents();
    }
  }, [initialized, fetchEvents]);

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
