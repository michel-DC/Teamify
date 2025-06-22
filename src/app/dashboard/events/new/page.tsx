import { EventForm } from "@/components/dashboard/events/new/event-form-new";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewEventPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("auth/login");
  }

  const organization = await prisma.organization.findFirst({
    where: {
      ownerId: user.id,
    },
  });

  if (!organization) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">Créer un nouvel événement</h1>
      <EventForm orgId={organization.id.toString()} />
    </div>
  );
}
