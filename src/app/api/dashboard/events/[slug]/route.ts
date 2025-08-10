import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { EventCategory, EventStatus } from "@prisma/client";

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

    /**
     * Recherche par eventCode ou publicId avec l'UID utilisateur
     */
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
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
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération de l'événement",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'événement" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { slug } = await params;

    /**
     * Recherche par eventCode ou publicId avec l'UID utilisateur
     */
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

    /**
     * @param Préparation des données pour la mise à jour
     *
     * Traite et valide les données reçues avant la mise à jour
     */
    const updateData: any = {};

    // Traitement des champs de base
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    // Traitement des dates
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      updateData.endDate = new Date(body.endDate);
    }

    // Traitement des nombres
    if (body.capacity !== undefined) {
      updateData.capacity = body.capacity ? parseInt(body.capacity) : null;
    }
    if (body.budget !== undefined) {
      updateData.budget = body.budget ? parseFloat(body.budget) : null;
    }

    // Traitement des enums
    if (body.status && Object.values(EventStatus).includes(body.status)) {
      updateData.status = body.status;
    }
    if (body.category && Object.values(EventCategory).includes(body.category)) {
      updateData.category = body.category;
    }

    /**
     * Mise à jour de l'événement
     */
    const updatedEvent = await prisma.event.update({
      where: {
        id: event.id,
      },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la mise à jour de l'événement",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour de l'événement" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { slug } = await params;

    /**
     * Recherche par eventCode ou publicId avec l'UID utilisateur
     */
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

    /**
     * Mise à jour de l'événement
     */
    const updatedEvent = await prisma.event.update({
      where: {
        id: event.id,
      },
      data: body,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la mise à jour de l'événement",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour de l'événement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    /**
     * Recherche par eventCode ou publicId avec l'UID utilisateur
     */
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

    /**
     * Suppression de l'événement avec suppression en cascade
     * automatique des todos et invitations
     */
    await prisma.event.delete({
      where: {
        id: event.id,
      },
    });

    return NextResponse.json(
      { message: "Événement supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la suppression de l'événement",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression de l'événement" },
      { status: 500 }
    );
  }
}
