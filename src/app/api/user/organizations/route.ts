import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      console.log("API Organizations: Utilisateur non authentifié");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("API Organizations: Utilisateur authentifié:", user.uid);

    try {
      const ownedOrganizations = await prisma.organization.findMany({
        where: {
          ownerUid: user.uid,
          isDeleted: false,
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

      console.log(
        "API Organizations: Organisations propriétaire trouvées:",
        ownedOrganizations.length
      );

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
          isDeleted: false,
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

      console.log(
        "API Organizations: Organisations membre trouvées:",
        memberOrganizations.length
      );

      const memberWithRole = memberOrganizations.map((org) => ({
        ...org,
        role: org.organizationMembers[0]?.role || "MEMBER",
        organizationMembers: undefined,
      }));

      /**
       * Combinaison des deux listes en évitant les doublons
       * Les organisations dont l'utilisateur est propriétaire ont priorité
       */
      const allOrganizations = [...ownedWithRole];

      memberWithRole.forEach((memberOrg) => {
        const isAlreadyIncluded = allOrganizations.some(
          (org) => org.id === memberOrg.id
        );
        if (!isAlreadyIncluded) {
          allOrganizations.push(memberOrg);
        }
      });

      console.log(
        "API Organizations: Total des organisations:",
        allOrganizations.length
      );

      return NextResponse.json({ organizations: allOrganizations });
    } catch (dbError) {
      console.error("API Organizations: Erreur base de données:", dbError);
      return NextResponse.json(
        { error: "Erreur base de données" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      "API Organizations: Erreur générale lors de la récupération des organisations",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
