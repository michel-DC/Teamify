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
     * avec le rôle OWNER
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

    // Ajouter le rôle OWNER aux organisations dont l'utilisateur est propriétaire
    const ownedWithRole = ownedOrganizations.map((org) => ({
      ...org,
      role: "OWNER",
    }));

    /**
     * Récupération des organisations dont l'utilisateur est membre
     * avec leur rôle spécifique
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
        organizationMembers: {
          where: {
            userUid: user.uid,
          },
          select: {
            role: true,
          },
        },
      },
    });

    // Extraire le rôle de l'utilisateur dans chaque organisation
    const memberWithRole = memberOrganizations.map((org) => ({
      ...org,
      role: org.organizationMembers[0]?.role || "MEMBER",
      organizationMembers: undefined, // Supprimer ce champ de la réponse
    }));

    /**
     * Combinaison des deux listes en évitant les doublons
     * Les organisations dont l'utilisateur est propriétaire ont priorité
     */
    const allOrganizations = [...ownedWithRole];

    // Ajouter les organisations dont l'utilisateur est membre mais pas propriétaire
    memberWithRole.forEach((memberOrg) => {
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
