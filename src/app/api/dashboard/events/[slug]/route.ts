import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";
import { EventCategory, EventStatus } from "@prisma/client";
import { uploadImage } from "@/lib/upload-utils";
import { calculateEventStatus } from "@/lib/event-status-utils";
import { createNotificationForOrganizationMembers } from "@/lib/notification-service";

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
     * Recherche par eventCode ou publicId
     */
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
      include: {
        organization: {
          select: {
            id: true,
            publicId: true,
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

    /**
     * Vérification que l'utilisateur a accès à l'organisation de l'événement
     */
    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
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

    const { slug } = await params;

    console.log("[PATCH] Données reçues:", {
      slug,
      userUid: user.uid,
    });

    /**
     * Recherche par eventCode ou publicId
     */
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
    });

    console.log(
      "[PATCH] Événement trouvé:",
      event ? { id: event.id, title: event.title } : null
    );

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a accès à l'organisation de l'événement
     */
    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
      );
    }

    // Traitement des FormData
    const formData = await request.formData();

    console.log("[PATCH] FormData reçues:", {
      title: formData.get("title"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      location: formData.get("location"),
      locationCoords: formData.get("locationCoords"),
      capacity: formData.get("capacity"),
      status: formData.get("status"),
      budget: formData.get("budget"),
      category: formData.get("category"),
      isPublic: formData.get("isPublic"),
      hasFile: !!formData.get("file"),
    });

    /**
     * @param Préparation des données pour la mise à jour
     *
     * Traite et valide les données reçues avant la mise à jour
     */
    const updateData: any = {};

    // Traitement des champs de base
    if (formData.get("title"))
      updateData.title = formData.get("title") as string;
    if (formData.get("description") !== null)
      updateData.description = formData.get("description") as string;
    if (formData.get("location") !== null)
      updateData.location = formData.get("location") as string;
    if (formData.get("isPublic") !== null)
      updateData.isPublic = formData.get("isPublic") === "true";

    // Traitement des coordonnées de localisation
    const locationCoordsRaw = formData.get("locationCoords") as string | null;
    if (locationCoordsRaw) {
      try {
        const locationCoords = JSON.parse(locationCoordsRaw);
        updateData.locationCoords = locationCoords;
      } catch (error) {
        console.warn("Format de coordonnées invalide:", error);
      }
    }

    // Traitement des dates
    if (formData.get("startDate")) {
      updateData.startDate = new Date(formData.get("startDate") as string);
    }
    if (formData.get("endDate")) {
      updateData.endDate = new Date(formData.get("endDate") as string);
    }

    // Recalcul automatique du statut si les dates ont été modifiées
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate || event.startDate;
      const endDate = updateData.endDate || event.endDate;

      if (startDate && endDate) {
        updateData.status = calculateEventStatus(startDate, endDate);
        console.log(
          "[PATCH] Statut recalculé automatiquement:",
          updateData.status
        );
      }
    }

    // Traitement des nombres
    if (formData.get("capacity") !== null) {
      updateData.capacity = parseInt(formData.get("capacity") as string) || 0;
    }
    if (formData.get("budget") !== null) {
      const budgetValue = formData.get("budget") as string;
      updateData.budget = budgetValue ? parseFloat(budgetValue) : null;
    }

    // Traitement des enums (sauf le statut qui est maintenant calculé automatiquement)
    if (
      formData.get("category") &&
      Object.values(EventCategory).includes(
        formData.get("category") as EventCategory
      )
    ) {
      updateData.category = formData.get("category") as EventCategory;
    }

    // Traitement de l'image
    const imageUrl = formData.get("imageUrl") as string;
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    console.log("[PATCH] Données de mise à jour:", updateData);

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

    console.log("[PATCH] Événement mis à jour:", {
      id: updatedEvent.id,
      title: updatedEvent.title,
      status: updatedEvent.status,
    });

    // Créer des notifications pour tous les membres de l'organisation
    try {
      await createNotificationForOrganizationMembers(event.orgId, {
        notificationName: "Événement modifié",
        notificationDescription: `L'événement "${updatedEvent.title}" a été modifié`,
        notificationType: "UPDATE",
        eventPublicId: updatedEvent.publicId,
      });
    } catch (notificationError) {
      console.error(
        "Erreur lors de la création des notifications:",
        notificationError
      );
      // Ne pas faire échouer la modification de l'événement si les notifications échouent
    }

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

    const { slug } = await params;

    /**
     * Recherche par eventCode ou publicId
     */
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

    /**
     * Vérification que l'utilisateur a accès à l'organisation de l'événement
     */
    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
      );
    }

    const body = await request.json();

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

    // Recalcul automatique du statut si les dates ont été modifiées
    if (updatedEvent.startDate || updatedEvent.endDate) {
      const startDate = updatedEvent.startDate || event.startDate;
      const endDate = updatedEvent.endDate || event.endDate;

      if (startDate && endDate) {
        updatedEvent.status = calculateEventStatus(startDate, endDate);
        console.log(
          "[PUT] Statut recalculé automatiquement:",
          updatedEvent.status
        );
      }
    }

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
     * Recherche par eventCode ou publicId
     */
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

    /**
     * Vérification que l'utilisateur a accès à l'organisation de l'événement
     */
    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
      );
    }

    /**
     * Suppression de l'événement avec suppression en cascade
     * automatique des todos et invitations
     */
    await prisma.$transaction(async (tx) => {
      // Supprime l'événement (cascade automatique pour EventByCode, todos, invitations)
      await tx.event.delete({
        where: {
          id: event.id,
        },
      });

      // Décrémente le compteur d'événements de l'organisation
      await tx.organization.update({
        where: { id: event.orgId },
        data: {
          eventCount: {
            decrement: 1,
          },
        },
      });
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
