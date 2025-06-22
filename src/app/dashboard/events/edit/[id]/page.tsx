"use client";

import EditEventForm from "@/components/dashboard/events/edit/edit-event-form";
import { useParams } from "next/navigation";

export default function EditEventPage() {
  const params = useParams();
  const eventId = parseInt(params.id as string, 10);

  return (
    <div className="container mx-auto py-10">
      <EditEventForm eventId={eventId} />
    </div>
  );
}
