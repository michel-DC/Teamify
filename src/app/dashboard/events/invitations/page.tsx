import React from "react";
import InvitationTable from "@/components/dashboard/events/invitation-table";

export default function InvitationsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestion des invitations</h1>
        <p className="text-gray-600">
          Envoyez et suivez les invitations à vos événements
        </p>
      </div>

      <InvitationTable eventSlug="current" />
    </div>
  );
}
