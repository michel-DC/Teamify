"use client";

import StepWizard from "./components/StepWizard";
import ClientGate from "./ClientGate";

export default function CreateOrganizationPage() {
  return (
    <ClientGate>
      <StepWizard />
    </ClientGate>
  );
}
