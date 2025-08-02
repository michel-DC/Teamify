// app/api/user/has-organization/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const organizationsCount = await prisma.organization.count({
      where: {
        ownerId: user.id,
      },
    });

    const hasOrganization = organizationsCount > 0;

    return NextResponse.json({ hasOrganization }, { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la vérification de l'organisation",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la vérification de l'organisation" },
      { status: 500 }
    );
  }
}
