import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  /**
   * Récupération de l'utilisateur connecté
   */
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    /**
     * Récupération des organisations dont l'utilisateur est propriétaire
     */
    const ownedOrganizations = await prisma.organization.findMany({
      where: { ownerUid: user.uid },
      select: {
        id: true,
        publicId: true,
        name: true,
        bio: true,
        profileImage: true,
        memberCount: true,
        organizationType: true,
        mission: true,
        eventCount: true,
        createdAt: true,
        location: true,
      },
    });

    /**
     * Récupération des organisations dont l'utilisateur est membre
     */
    const memberOrganizations = await prisma.organization.findMany({
      where: {
        organizationMembers: {
          some: {
            userUid: user.uid,
          },
        },
      },
      select: {
        id: true,
        publicId: true,
        name: true,
        bio: true,
        profileImage: true,
        memberCount: true,
        organizationType: true,
        mission: true,
        eventCount: true,
        createdAt: true,
        location: true,
      },
    });

    /**
     * Combinaison des deux listes en évitant les doublons
     */
    const allOrganizations = [...ownedOrganizations];

    // Ajouter les organisations dont l'utilisateur est membre mais pas propriétaire
    memberOrganizations.forEach((memberOrg) => {
      const isAlreadyIncluded = allOrganizations.some(
        (org) => org.id === memberOrg.id
      );
      if (!isAlreadyIncluded) {
        allOrganizations.push(memberOrg);
      }
    });

    return NextResponse.json({ organizations: allOrganizations });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération des organisations",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
