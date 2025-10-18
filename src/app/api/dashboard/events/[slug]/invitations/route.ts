import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";

export async function GET(
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

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
      include: {
        organization: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    const hasAccess = await hasOrganizationAccess(
      user.uid,
      event.organization.id
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Vous n'avez pas les permissions pour voir cet événement" },
        { status: 403 }
      );
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        eventCode: event.eventCode,
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des invitations" },
      { status: 500 }
    );
  }
}
