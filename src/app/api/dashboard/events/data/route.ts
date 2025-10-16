import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationPublicId = searchParams.get("organizationId");

    if (!organizationPublicId) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    /**
     * Récupération de l'organisation par son publicId
     */
    const organization = await prisma.organization.findFirst({
      where: {
        publicId: organizationPublicId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a accès à l'organisation (propriétaire OU membre)
     */
    const hasAccess = await hasOrganizationAccess(user.uid, organization.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Organisation non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    /**
     * Récupération des événements de l'organisation spécifiée
     * (tous les événements de l'organisation, pas seulement ceux créés par l'utilisateur)
     */
    const events = await prisma.event.findMany({
      where: {
        orgId: organization.id,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const eventsWithPublicId = events.map((event) => ({
      ...event,
      id: event.publicId,
    }));

    return NextResponse.json({ events: eventsWithPublicId }, { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération des événements",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}
