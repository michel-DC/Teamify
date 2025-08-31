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

    /**
     * Vérification du nombre d'organisations dont l'utilisateur est propriétaire
     */
    const ownedOrganizationsCount = await prisma.organization.count({
      where: {
        ownerUid: user.uid,
      },
    });

    /**
     * Vérification du nombre d'organisations dont l'utilisateur est membre
     */
    const memberOrganizationsCount = await prisma.organizationMember.count({
      where: {
        userUid: user.uid,
      },
    });

    const hasOrganization =
      ownedOrganizationsCount > 0 || memberOrganizationsCount > 0;

    return NextResponse.json(
      {
        hasOrganization,
        ownedCount: ownedOrganizationsCount,
        memberCount: memberOrganizationsCount,
      },
      { status: 200 }
    );
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
