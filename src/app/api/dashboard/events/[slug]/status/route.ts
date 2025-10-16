import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventStatus } from "@prisma/client";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { status } = await request.json();

    if (!Object.values(EventStatus).includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: event.id,
      },
      data: { status },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            publicId: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Statut modifié avec succès",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Erreur lors de la modification du statut:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
