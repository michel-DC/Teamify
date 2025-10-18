"use client";

import { useEffect } from "react";
import { useEventsStore } from "@/store/eventsStore";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

export function useEvents() {
  const { events, loading, error, initialized, fetchEvents } = useEventsStore();
  const { activeOrganization } = useActiveOrganization();

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

export function useFilteredEvents(filterFn?: (event: any) => boolean) {
  const { events, loading, error, initialized, fetchEvents } = useEventsStore();
  const { activeOrganization } = useActiveOrganization();

  useEffect(() => {
    if (activeOrganization && !initialized) {
      fetchEvents(activeOrganization.publicId);
    }
  }, [activeOrganization, initialized, fetchEvents]);

  const filteredEvents = filterFn ? events.filter(filterFn) : events;

  return {
    events: filteredEvents,
    loading,
    error,
    initialized,
    fetchEvents,
  };
}
