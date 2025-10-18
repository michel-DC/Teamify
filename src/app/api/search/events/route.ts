import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const ownedOrganizations = await prisma.organization.findMany({
      where: { ownerUid: user.uid },
      select: { id: true },
    });

    const memberOrganizations = await prisma.organization.findMany({
      where: {
        organizationMembers: {
          some: {
            userUid: user.uid,
          },
        },
      },
      select: { id: true },
    });

    const allOrganizationIds = [
      ...ownedOrganizations.map((org) => org.id),
      ...memberOrganizations.map((org) => org.id),
    ];

    if (allOrganizationIds.length === 0) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const events = await prisma.event.findMany({
      where: {
        orgId: {
          in: allOrganizationIds,
        },
        AND: [
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                location: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                eventCode: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            publicId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const eventsWithPublicId = events.map((event) => ({
      ...event,
      id: event.publicId,
      url: `/dashboard/events/details/${event.eventCode}`,
    }));

    return NextResponse.json({ events: eventsWithPublicId }, { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la recherche d'événements",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la recherche d'événements" },
      { status: 500 }
    );
  }
}
