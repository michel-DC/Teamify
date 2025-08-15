import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const organizationId = parseInt(id);

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: "ID d'organisation invalide" },
        { status: 400 }
      );
    }

    /**
     * Récupération de l'organisation avec vérification du propriétaire
     */
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: user.uid,
      },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            eventCode: true,
            isCancelled: true,
            location: true,
            capacity: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization }, { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération de l'organisation",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'organisation" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const organizationId = parseInt(id);
    const body = await request.json();

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: "ID d'organisation invalide" },
        { status: 400 }
      );
    }

    /**
     * Vérification du propriétaire avant mise à jour
     */
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: user.uid,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    /**
     * Mise à jour de l'organisation
     */
    const updatedOrganization = await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: body,
      include: {
        events: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            eventCode: true,
            isCancelled: true,
            location: true,
            capacity: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(
      { organization: updatedOrganization },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la mise à jour de l'organisation",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour de l'organisation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const organizationId = parseInt(id);

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: "ID d'organisation invalide" },
        { status: 400 }
      );
    }

    /**
     * Vérification du propriétaire avant suppression
     */
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: user.uid,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    /**
     * Suppression de l'organisation avec suppression en cascade
     * automatique des événements et leurs dépendances
     */
    await prisma.organization.delete({
      where: {
        id: organizationId,
      },
    });

    return NextResponse.json(
      { message: "Organisation supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la suppression de l'organisation",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression de l'organisation" },
      { status: 500 }
    );
  }
}
