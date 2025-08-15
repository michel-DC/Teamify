"use client";

import { useEffect, useState } from "react";
import { DataTable, type Event } from "./events-table";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

export function EventsTableWrapper() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeOrganization } = useActiveOrganization();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!activeOrganization) return;

      try {
        const response = await fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        );
        const data = await response.json();
        setEvents(data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeOrganization]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return <DataTable data={events} />;
}
