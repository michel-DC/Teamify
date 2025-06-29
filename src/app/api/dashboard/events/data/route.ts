import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const events = await prisma.event.findMany({
      where: {
        ownerId: user.id,
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
    console.error("[API_EVENTS_DATA_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}
