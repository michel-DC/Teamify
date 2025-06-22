"use client";

import { useParams } from "next/navigation";
import DeleteEventBanner from "@/components/dashboard/events/delete/delete-event-banner";

export default function DeleteEventPage() {
  const params = useParams();
  const eventId = parseInt(params.id as string, 10);

  return (
    <div className="container mx-auto py-10">
      <DeleteEventBanner eventId={eventId} />
    </div>
  );
}
