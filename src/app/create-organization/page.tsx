"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StepWizard from "./components/StepWizard";

export default async function HelloPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return <StepWizard />;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organization: true },
  });

  if (user?.organization) {
    redirect("/dashboard"); // organisation déjà créée
  }

  return <StepWizard />;
}
