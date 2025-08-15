import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    /**
     * Récupération de l'utilisateur connecté
     */
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    /**
     * Récupération du paramètre d'organisation depuis l'URL
     */
    const { searchParams } = new URL(request.url);
    const organizationPublicId = searchParams.get("organizationId");

    if (!organizationPublicId) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    /**
     * Vérification que l'organisation appartient à l'utilisateur
     */
    const organization = await prisma.organization.findFirst({
      where: {
        publicId: organizationPublicId,
        ownerUid: user.uid,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    /**
     * Récupération des événements de l'organisation spécifiée
     */
    const events = await prisma.event.findMany({
      where: {
        orgId: organization.id,
        ownerUid: user.uid,
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
