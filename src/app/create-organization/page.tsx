"use client";

import StepWizard from "./components/StepWizard";
import ClientGate from "./client-gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify - Créer votre première organisation",
  description: "Créer votre première organisation",
};

export default function CreateOrganizationPage() {
  return (
    <ClientGate>
      <StepWizard />
    </ClientGate>
  );
}
