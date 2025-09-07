import StepWizard from "./components/StepWizard";
import ClientGate from "./client-gate";

export const metadata = {
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
