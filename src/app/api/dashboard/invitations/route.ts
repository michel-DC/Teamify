import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * @param Récupération de toutes les invitations de l'organisation
 *
 * Retourne toutes les invitations pour tous les événements de l'utilisateur
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    // Récupérer tous les événements de l'utilisateur
    const userEvents = await prisma.event.findMany({
      where: {
        ownerUid: user.uid,
      },
      select: {
        eventCode: true,
        title: true,
      },
    });

    if (userEvents.length === 0) {
      return NextResponse.json({ invitations: [] }, { status: 200 });
    }

    // Récupérer toutes les invitations pour ces événements
    const invitations = await prisma.invitation.findMany({
      where: {
        eventCode: {
          in: userEvents.map((event) => event.eventCode),
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    // Ajouter le titre de l'événement à chaque invitation
    const invitationsWithEventTitle = invitations.map((invitation) => {
      const event = userEvents.find(
        (e) => e.eventCode === invitation.eventCode
      );
      return {
        ...invitation,
        eventTitle: event?.title || "Événement inconnu",
      };
    });

    return NextResponse.json(
      {
        invitations: invitationsWithEventTitle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des invitations" },
      { status: 500 }
    );
  }
}
