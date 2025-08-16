import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * @param Récupération des invitations pour un événement
 *
 * Retourne toutes les invitations associées à un événement
 */
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

    // Vérifier que l'événement appartient à l'utilisateur
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
        ownerUid: user.uid,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les invitations pour cet événement
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
