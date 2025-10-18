import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("API Stats: Début de la requête");

    const user = await getCurrentUser();

    if (!user) {
      console.log("API Stats: Utilisateur non authentifié");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("API Stats: Utilisateur authentifié:", user.uid);

    const { searchParams } = new URL(request.url);
    const organizationPublicId = searchParams.get("organizationPublicId");

    if (!organizationPublicId) {
      console.log("API Stats: Aucun publicId d'organisation fourni");
      return NextResponse.json(
        { error: "PublicId d'organisation requis" },
        { status: 400 }
      );
    }

    console.log(
      "API Stats: PublicId d'organisation reçu:",
      organizationPublicId
    );

    const activeOrganization = await prisma.organization.findFirst({
      where: {
        publicId: organizationPublicId,
        OR: [
          { ownerUid: user.uid },
          {
            organizationMembers: {
              some: {
                userUid: user.uid,
              },
            },
          },
        ],
        isDeleted: false,
      },
      include: {
        events: {
          select: {
            id: true,
            status: true,
            isCancelled: true,
          },
        },
        organizationMembers: {
          select: {
            id: true,
            userUid: true,
            role: true,
          },
        },
      },
    });

    if (!activeOrganization) {
      console.log("API Stats: Aucune organisation active trouvée");
      return NextResponse.json(
        { error: "Aucune organisation active" },
        { status: 404 }
      );
    }

    console.log(
      "API Stats: Organisation active trouvée:",
      activeOrganization.publicId
    );

    let userRole = "MEMBER";
    if (activeOrganization.ownerUid === user.uid) {
      userRole = "OWNER";
    } else {
      const membership = activeOrganization.organizationMembers.find(
        (member) => member.userUid === user.uid
      );
      if (membership) {
        userRole = membership.role;
      }
    }

    const stats = {
      userRole,
      memberCount: activeOrganization.memberCount,
      eventsCount: activeOrganization.events.length,
      organizationId: activeOrganization.id,
      organizationPublicId: activeOrganization.publicId,
      organizationName: activeOrganization.name,
    };

    console.log("API Stats: Stats calculées:", stats);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
